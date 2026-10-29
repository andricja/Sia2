<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medicines = [
            [
                'medicine_code' => 'MED001',
                'barcode' => '1234567890123',
                'name' => 'Paracetamol 500mg',
                'description' => 'For fever and mild to moderate pain relief',
                'category' => 'Pain Relief',
                'price' => 5.50,
                'stock_quantity' => 150,
                'expiry_date' => '2027-12-31'
            ],
            [
                'medicine_code' => 'MED002',
                'barcode' => '1234567890124',
                'name' => 'Amoxicillin 500mg',
                'description' => 'Broad-spectrum antibiotic for bacterial infections',
                'category' => 'Antibiotic',
                'price' => 12.00,
                'stock_quantity' => 89,
                'expiry_date' => '2027-06-30'
            ],
            [
                'medicine_code' => 'MED003',
                'barcode' => '1234567890125',
                'name' => 'Ibuprofen 400mg',
                'description' => 'Anti-inflammatory pain reliever',
                'category' => 'Pain Relief',
                'price' => 8.75,
                'stock_quantity' => 120,
                'expiry_date' => '2027-09-15'
            ],
            [
                'medicine_code' => 'MED004',
                'barcode' => '1234567890126',
                'name' => 'Vitamin C 500mg',
                'description' => 'Immune system support and antioxidant',
                'category' => 'Supplement',
                'price' => 6.25,
                'stock_quantity' => 200,
                'expiry_date' => '2028-03-31'
            ],
            [
                'medicine_code' => 'MED005',
                'barcode' => '1234567890127',
                'name' => 'Cetirizine 10mg',
                'description' => 'For allergies and hay fever symptoms',
                'category' => 'Antihistamine',
                'price' => 7.50,
                'stock_quantity' => 95,
                'expiry_date' => '2027-11-20'
            ],
            [
                'medicine_code' => 'MED006',
                'barcode' => '1234567890128',
                'name' => 'Omeprazole 20mg',
                'description' => 'Reduces stomach acid production',
                'category' => 'Antacid',
                'price' => 15.00,
                'stock_quantity' => 75,
                'expiry_date' => '2027-08-10'
            ],
            [
                'medicine_code' => 'MED007',
                'barcode' => '1234567890129',
                'name' => 'Losartan 50mg',
                'description' => 'Blood pressure medication',
                'category' => 'Hypertension',
                'price' => 18.50,
                'stock_quantity' => 60,
                'expiry_date' => '2027-10-05'
            ],
            [
                'medicine_code' => 'MED008',
                'barcode' => '1234567890130',
                'name' => 'Metformin 500mg',
                'description' => 'Type 2 diabetes management',
                'category' => 'Diabetes',
                'price' => 10.00,
                'stock_quantity' => 110,
                'expiry_date' => '2027-07-22'
            ],
            [
                'medicine_code' => 'MED009',
                'barcode' => '1234567890131',
                'name' => 'Aspirin 100mg',
                'description' => 'Low-dose for heart health',
                'category' => 'Cardiovascular',
                'price' => 4.50,
                'stock_quantity' => 180,
                'expiry_date' => '2028-01-15'
            ],
            [
                'medicine_code' => 'MED010',
                'barcode' => '1234567890132',
                'name' => 'Loperamide 2mg',
                'description' => 'For diarrhea relief',
                'category' => 'Gastrointestinal',
                'price' => 6.75,
                'stock_quantity' => 85,
                'expiry_date' => '2027-05-18'
            ],
        ];

        foreach ($medicines as $medicine) {
            \App\Models\Medicine::create($medicine);
        }
    }
}
