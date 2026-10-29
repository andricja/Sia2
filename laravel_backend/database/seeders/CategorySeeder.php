<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Pain Relief',
                'slug' => 'pain-relief',
                'description' => 'Analgesics and pain management medications',
                'icon' => 'pill',
                'is_active' => true,
                'display_order' => 1
            ],
            [
                'name' => 'Antibiotics',
                'slug' => 'antibiotics',
                'description' => 'Antibacterial medications for infections',
                'icon' => 'shield-plus',
                'is_active' => true,
                'display_order' => 2
            ],
            [
                'name' => 'Vitamins & Supplements',
                'slug' => 'vitamins-supplements',
                'description' => 'Nutritional supplements and vitamins',
                'icon' => 'sparkles',
                'is_active' => true,
                'display_order' => 3
            ],
            [
                'name' => 'Cold & Flu',
                'slug' => 'cold-flu',
                'description' => 'Medications for cold, cough, and flu symptoms',
                'icon' => 'thermometer',
                'is_active' => true,
                'display_order' => 4
            ],
            [
                'name' => 'Digestive Health',
                'slug' => 'digestive-health',
                'description' => 'Gastrointestinal and digestive medications',
                'icon' => 'activity',
                'is_active' => true,
                'display_order' => 5
            ],
            [
                'name' => 'Cardiovascular',
                'slug' => 'cardiovascular',
                'description' => 'Heart and blood pressure medications',
                'icon' => 'heart-pulse',
                'is_active' => true,
                'display_order' => 6
            ],
            [
                'name' => 'Diabetes',
                'slug' => 'diabetes',
                'description' => 'Blood sugar management medications',
                'icon' => 'syringe',
                'is_active' => true,
                'display_order' => 7
            ],
            [
                'name' => 'Respiratory',
                'slug' => 'respiratory',
                'description' => 'Asthma, COPD, and breathing medications',
                'icon' => 'wind',
                'is_active' => true,
                'display_order' => 8
            ],
            [
                'name' => 'Allergy',
                'slug' => 'allergy',
                'description' => 'Antihistamines and allergy relief',
                'icon' => 'leaf',
                'is_active' => true,
                'display_order' => 9
            ],
            [
                'name' => 'Skin Care',
                'slug' => 'skin-care',
                'description' => 'Topical medications and skin treatments',
                'icon' => 'droplet',
                'is_active' => true,
                'display_order' => 10
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
