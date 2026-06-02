import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Staff Contacts
  await prisma.staffContact.deleteMany()
  await prisma.staffContact.createMany({ data: [
    { name: 'Scott Vollmer',       title: 'General Manager',                   email: 'scott.vollmer@realberry.com',       category: 'MANAGEMENT',    sortOrder: 1 },
    { name: 'Tiffany Frederiksen', title: 'Senior Property Manager',           email: 'tiffany.frederiksen@realberry.com', category: 'MANAGEMENT',    sortOrder: 2 },
    { name: 'Liam Walsh',          title: 'Property Manager',                  email: 'liam.walsh@realberry.com',          category: 'MANAGEMENT',    sortOrder: 3 },
    { name: 'Ashley Sinclair',     title: 'Senior Property Administrator',     email: 'ashley.sinclair@realberry.com',     category: 'MANAGEMENT',    sortOrder: 4 },
    { name: 'Laura Aldrich',       title: 'Marketing and Events Manager',      email: 'Laura.Aldrich@realberry.com',       category: 'MANAGEMENT',    sortOrder: 5 },
    { name: 'Josh Boyles',         title: 'Safety Operations Manager',         email: 'security@dairyblock.com',           phone: '(303) 249-0178',   category: 'SECURITY',     sortOrder: 1 },
    { name: 'Marjhonna Brown',     title: 'Security Site Supervisor',          email: 'security@dairyblock.com',           category: 'SECURITY',     sortOrder: 2 },
    { name: 'Rick Agema',          title: 'Lead Maintenance Technician',       email: 'pm@dairyblock.com',                 category: 'MAINTENANCE',  sortOrder: 1 },
    { name: 'Reid Maddux',         title: 'Maintenance Technician',            email: 'pm@dairyblock.com',                 category: 'MAINTENANCE',  sortOrder: 2 },
    { name: 'Marlon Velasquez',    title: 'Maintenance Technician',            email: 'pm@dairyblock.com',                 category: 'MAINTENANCE',  sortOrder: 3 },
  ]})

  // Building Hours
  await prisma.buildingHours.deleteMany()
  await prisma.buildingHours.createMany({ data: [
    { label: 'Monday – Friday',   hours: '7:00 AM – 9:00 PM', sortOrder: 1 },
    { label: 'Saturday',          hours: '9:00 AM – 1:00 PM', sortOrder: 2 },
    { label: 'Sunday',            hours: 'Closed',             sortOrder: 3 },
    { label: 'Observed Holidays', hours: 'Closed (locked all day)', sortOrder: 4 },
  ]})

  // Handbook Sections — Office
  await prisma.handbookSection.deleteMany({ where: { handbook: 'OFFICE' } })
  await prisma.handbookSection.createMany({ data: [
    { handbook: 'OFFICE', sortOrder: 1, title: 'Welcome',
      content: 'Welcome to Dairy Block, Denver\'s premier mixed-use micro-district in the heart of LoDo. This handbook outlines the policies, procedures, and resources available to office tenants. Please review it carefully and reach out to the property management team with any questions.' },
    { handbook: 'OFFICE', sortOrder: 2, title: 'Property Management Contact',
      content: 'For all general inquiries, maintenance requests, and administrative matters, please contact the property management team at pm@dairyblock.com. The management office is located at 1800 Wazee Street, Suite 200, Denver, CO 80202.' },
    { handbook: 'OFFICE', sortOrder: 3, title: 'Building Access & Hours',
      content: 'Standard building hours are Monday through Friday, 7:00 AM to 9:00 PM, and Saturday, 9:00 AM to 1:00 PM. The building is closed on Sundays and observed holidays. After-hours access is available via key card. Lost or stolen key cards must be reported to property management immediately.' },
    { handbook: 'OFFICE', sortOrder: 4, title: 'Keys & Access Cards',
      content: 'Access cards and keys are issued by the property management team. Replacement fees apply: Access Card replacement — $25.00. Key replacement — $50.00. Technician labor for lock-related services — $83.68 per hour. To request keys or access cards, submit a Key Request form through the Tenant Hub.' },
    { handbook: 'OFFICE', sortOrder: 5, title: 'Fitness Center',
      content: 'The fitness center is located on the 2nd floor of 1825 Blake Street. It is available exclusively to office tenants. A completed fitness waiver is required before first use. The fitness center includes cardio equipment, free weights, locker rooms, and a yoga studio. Please submit a Fitness Center Waiver through the Tenant Hub to gain access.' },
    { handbook: 'OFFICE', sortOrder: 6, title: 'Parking',
      content: 'Parking is managed by LAZ Parking. For parking inquiries, contact LAZ directly at (303) 291-1111. Valet service is available through Parkwell at (720) 504-3620. In the event of an unauthorized vehicle, contact Ace Towing at (303) 980-8770.' },
    { handbook: 'OFFICE', sortOrder: 7, title: 'Security',
      content: 'Security is available 24 hours a day, 7 days a week. For non-emergency security matters, contact the security desk at (303) 249-0178 or email security@dairyblock.com. In case of emergency, always call 911 first.' },
    { handbook: 'OFFICE', sortOrder: 8, title: 'Maintenance & Repairs',
      content: 'For maintenance requests, please submit a request through the Tenant Hub portal or email pm@dairyblock.com. After-hours maintenance emergencies can be reached at (303) 249-0178 or (970) 962-0011. Please allow standard response times for non-emergency requests.' },
    { handbook: 'OFFICE', sortOrder: 9, title: 'Emergency Procedures',
      content: 'In the event of a fire or life-safety emergency, call 911 immediately. Each tenant is required to designate a primary and alternate Emergency Coordinator. Please submit your Emergency Coordinator information through the Tenant Hub. Evacuation routes are posted throughout the building.' },
    { handbook: 'OFFICE', sortOrder: 10, title: 'Pets',
      content: 'Pets are permitted in the building subject to approval and registration. All pets must be registered through the Tenant Hub Pet Registration form prior to bringing them into the building. Pets must be leashed at all times in common areas and owners are responsible for their pet\'s behavior.' },
  ]})

  // Handbook Sections — Retail
  await prisma.handbookSection.deleteMany({ where: { handbook: 'RETAIL' } })
  await prisma.handbookSection.createMany({ data: [
    { handbook: 'RETAIL', sortOrder: 1, title: 'Welcome',
      content: 'Welcome to Dairy Block, Denver\'s premier mixed-use micro-district in the heart of LoDo. This handbook outlines the policies, procedures, and resources available to retail tenants. Please review it carefully and reach out to the property management team with any questions.' },
    { handbook: 'RETAIL', sortOrder: 2, title: 'Property Management Contact',
      content: 'For all general inquiries, lease matters, and administrative needs, contact the property management team at pm@dairyblock.com. The management office is located at 1800 Wazee Street, Suite 200, Denver, CO 80202.' },
    { handbook: 'RETAIL', sortOrder: 3, title: 'Building Access & Hours',
      content: 'Standard building hours are Monday through Friday, 7:00 AM to 9:00 PM, and Saturday, 9:00 AM to 1:00 PM. The building is closed on Sundays and observed holidays. After-hours access is available via key card. Lost or stolen key cards must be reported to property management immediately.' },
    { handbook: 'RETAIL', sortOrder: 4, title: 'Monthly Sales Reporting',
      content: 'Retail tenants are required to submit a monthly sales report by the 5th of each month for the prior month. Reports must include gross sales and net sales figures. A 2% improvement fee is calculated based on gross sales and applied per your lease agreement. Sales reports can be submitted through the Tenant Hub portal using the Monthly Sales Report form.' },
    { handbook: 'RETAIL', sortOrder: 5, title: 'Keys & Access Cards',
      content: 'Access cards and keys are issued by the property management team. Replacement fees: Access Card — $25.00. Key — $50.00. Technician labor — $83.68 per hour. Submit a Key Request form through the Tenant Hub.' },
    { handbook: 'RETAIL', sortOrder: 6, title: 'Grease Disposal & Kitchen Operations',
      content: 'Retail tenants operating food service establishments must have a grease disposal plan on file with property management. Grease traps must be maintained and pumped on a regular schedule. Documentation of grease trap maintenance must be provided to property management upon request. Failure to maintain proper grease disposal may result in lease violations.' },
    { handbook: 'RETAIL', sortOrder: 7, title: 'Janitorial Services',
      content: 'Retail tenant spaces are the responsibility of the tenant for daily cleaning. Monarch Property Services is the preferred vendor for retail janitorial needs. Common areas are cleaned by building management. Please coordinate any special cleaning needs with the property management team.' },
    { handbook: 'RETAIL', sortOrder: 8, title: 'Parking',
      content: 'Parking is managed by LAZ Parking at (303) 291-1111. Valet service available through Parkwell at (720) 504-3620. Emergency towing handled by Ace Towing at (303) 980-8770.' },
    { handbook: 'RETAIL', sortOrder: 9, title: 'Security',
      content: 'Security is available 24/7. For non-emergency matters: (303) 249-0178 or security@dairyblock.com. In emergencies, always call 911 first.' },
    { handbook: 'RETAIL', sortOrder: 10, title: 'Emergency Procedures',
      content: 'In any life-safety emergency, call 911 immediately. Each tenant must designate a primary and alternate Emergency Coordinator. Submit your Emergency Coordinator information through the Tenant Hub. Evacuation routes are posted throughout the building.' },
  ]})

  console.log('Content seeded successfully.')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
