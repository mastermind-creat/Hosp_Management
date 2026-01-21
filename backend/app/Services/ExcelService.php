<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Illuminate\Support\Collection;

class ExcelService
{
    public function export(Collection $data, array $headings, $filename = 'report.xlsx')
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Add Headings
        for ($i = 0; $i < count($headings); $i++) {
            $sheet->setCellValue(chr(65 + $i) . '1', $headings[$i]);
        }

        // Add Data
        $row = 2;
        foreach ($data as $item) {
            $col = 0;
            foreach ($item as $value) {
                $sheet->setCellValue(chr(65 + $col) . $row, $value);
                $col++;
            }
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        
        $tempFile = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($tempFile);
        
        $content = file_get_contents($tempFile);
        unlink($tempFile);
        
        return $content;
    }
}
