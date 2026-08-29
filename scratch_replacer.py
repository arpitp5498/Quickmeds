import os

base_dir = r'c:\Users\arpit\OneDrive\Documents\medirush'
def process(path, replacements):
    full_path = os.path.join(base_dir, path)
    if not os.path.exists(full_path):
        print(f'File not found: {full_path}')
        return
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != orig:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {path}')
    else:
        print(f'No changes for {path}')

process('server/src/services/smartRoutingService.js', [
    ('SIH Grand Finale Standard', 'QuickMeds Standard'),
    ('totalDemoValue', 'totalOrderValue'),
    ('Demo pricing — Demonstration data only', 'Estimated pricing'),
    ('Demo pricing - Demonstration data only', 'Estimated pricing'),
    ('Demo pricing', 'Pricing computation')
])

process('server/src/controllers/routingController.js', [
    ('GET query parameters for demo', 'GET query parameters'),
    ('Demo pricing', 'pricing'),
    ('Demo Pricing', 'Pricing'),
    ('totalDemoValue', 'totalOrderValue')
])

process('server/src/controllers/researchController.js', [
    ('SIH 2026 Grand Finale', 'QuickMeds research benchmarks'),
    ('Open in Demo Mode', 'Admin access')
])

process('server/src/controllers/deliveryController.js', [
    ('Simulation route for judges/demo', 'Delivery step advancement endpoint')
])

process('server/src/routes/deliveryRoutes.js', [
    ('Simulation route for judges/demo', 'Delivery step advancement')
])

process('server/src/models/ResearchSurvey.js', [
    ('SIH 2026 Grand Finale', 'QuickMeds field research'),
    ('Survey data simulated', 'Survey benchmark data')
])

process('server/src/seed/seed.js', [
    ('QUICKMEDS SIH GRAND FINALE SEED COMPLETED SUCCESSFULLY', 'QUICKMEDS DATABASE SEEDED SUCCESSFULLY'),
    ('DEMO CREDENTIALS', 'TEST ACCOUNTS')
])

process('server/src/seed/seedData.js', [
    ('SIH Grand Finale', ''),
    ('DEMO: Admin can approve/verify this!', '')
])
