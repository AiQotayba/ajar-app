import type { ApiInstance } from '@useApi';
import { createAdminUser } from './seeders/admin-user';
import { createCategories } from './seeders/categories';
import { createListings } from './seeders/listings';
import { createLocations } from './seeders/locations';
import { createSettings } from './seeders/settings';
import { createSliders } from './seeders/sliders';

/**
 * Main seed data function
 * Orchestrates the entire seeding process
 */
export async function seedData(api: ApiInstance): Promise<void> {
  console.log('\n🔐 Step 1: Creating Admin User...');
  const adminToken = await createAdminUser(api);
  
  console.log('\n📂 Step 2: Creating Categories, Properties & Features...');
  const categories = await createCategories(api, adminToken);
  
  console.log('\n🌍 Step 3: Creating Locations...');
  const locations = await createLocations(api, adminToken);
  
  console.log('\n🏠 Step 4: Creating Listings...');
  await createListings(api, adminToken, categories, locations);
  
  console.log('\n🎚️ Step 5: Creating Sliders...');
  await createSliders(api, adminToken);
  
  console.log('\n⚙️ Step 6: Creating Settings...');
  await createSettings(api, adminToken);
  
  console.log('\n🎉 All seed data created successfully!');
}
