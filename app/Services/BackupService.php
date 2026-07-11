<?php

namespace App\Services;

use ZipArchive;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BackupService
{
    protected string $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/backups');
        if (!File::exists($this->backupDir)) {
            File::makeDirectory($this->backupDir, 0755, true);
        }
    }

    /**
     * Get list of all backup files.
     */
    public function getBackupsList(): array
    {
        if (!File::exists($this->backupDir)) {
            return [];
        }

        $files = File::files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            $backups[] = [
                'filename' => $file->getFilename(),
                'size' => round($file->getSize() / (1024 * 1024), 2) . ' MB',
                'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                'type' => str_contains($file->getFilename(), 'db-backup') ? 'Database' : 'Files',
            ];
        }

        // Sort descending by date
        usort($backups, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return $backups;
    }

    /**
     * Delete a backup file.
     */
    public function deleteBackup(string $filename): bool
    {
        $path = $this->backupDir . '/' . $filename;
        if (File::exists($path)) {
            return File::delete($path);
        }
        return false;
    }

    /**
     * Backup SQL Database via portable PHP PDO exporter.
     */
    public function backupDatabase(): string
    {
        $filename = 'db-backup-' . date('Ymd-His') . '.sql';
        $path = $this->backupDir . '/' . $filename;

        $dbName = DB::connection()->getDatabaseName();
        $tables = DB::select("SHOW TABLES");
        $keyName = "Tables_in_" . $dbName;

        $sqlDump = "-- MBanglaPatente Database SQL Backup\n";
        $sqlDump .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
        $sqlDump .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableRow) {
            $table = $tableRow->$keyName ?? null;
            if (!$table) continue;

            // 1. Create table structure
            $createTable = DB::select("SHOW CREATE TABLE `{$table}`")[0]->{'Create Table'} ?? '';
            $sqlDump .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $sqlDump .= $createTable . ";\n\n";

            // 2. Fetch rows and construct inserts
            $rows = DB::select("SELECT * FROM `{$table}`");
            if (empty($rows)) continue;

            foreach ($rows as $row) {
                $rowArray = (array) $row;
                $keys = array_keys($rowArray);
                $escapedKeys = array_map(fn($k) => "`{$k}`", $keys);
                
                $escapedValues = array_map(function ($val) {
                    if ($val === null) return 'NULL';
                    // Escape quote strings
                    $escaped = str_replace(
                        ["\\", "\x00", "\n", "\r", "'", '"', "\x1a"],
                        ["\\\\", "\\0", "\\n", "\\r", "\'", '\\"', "\\Z"],
                        $val
                    );
                    return "'{$escaped}'";
                }, array_values($rowArray));

                $sqlDump .= "INSERT INTO `{$table}` (" . implode(', ', $escapedKeys) . ") VALUES (" . implode(', ', $escapedValues) . ");\n";
            }
            $sqlDump .= "\n";
        }

        $sqlDump .= "SET FOREIGN_KEY_CHECKS=1;\n";

        File::put($path, $sqlDump);
        return $filename;
    }

    /**
     * Backup uploaded public media files.
     */
    public function backupFiles(): string
    {
        $filename = 'files-backup-' . date('Ymd-His') . '.zip';
        $path = $this->backupDir . '/' . $filename;

        $zip = new ZipArchive();
        if ($zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $uploadsPath = public_path('uploads');
            if (File::exists($uploadsPath)) {
                $files = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($uploadsPath),
                    \RecursiveIteratorIterator::LEAVE_ONLY
                );

                foreach ($files as $name => $file) {
                    if (!$file->isDir()) {
                        $filePath = $file->getRealPath();
                        $relativePath = 'uploads/' . substr($filePath, strlen($uploadsPath) + 1);
                        $zip->addFile($filePath, $relativePath);
                    }
                }
            }
            $zip->close();
        } else {
            throw new \Exception("Cannot open ZIP file destination: " . $path);
        }

        return $filename;
    }

    /**
     * Restore database from backup SQL file.
     */
    public function restoreDatabase(string $filename): bool
    {
        $path = $this->backupDir . '/' . $filename;
        if (!File::exists($path)) {
            return false;
        }

        $sql = File::get($path);
        
        try {
            DB::unprepared("SET FOREIGN_KEY_CHECKS=0;");
            DB::unprepared($sql);
            DB::unprepared("SET FOREIGN_KEY_CHECKS=1;");
            return true;
        } catch (\Throwable $e) {
            Log::error("Database Restoration failed: " . $e->getMessage());
            return false;
        }
    }
}
