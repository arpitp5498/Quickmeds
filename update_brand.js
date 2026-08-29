const fs = require('fs');
const path = require('path');

const basePath = 'c:/Users/DELL/Documents/medirush';

function replaceInFileByLine(relPath, lineReplacements) {
    const fullPath = path.join(basePath, relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    const isCRLF = content.includes('\r\n');
    let lines = content.split(/\r?\n/);
    let modified = false;

    lineReplacements.forEach(rep => {
        let idx = rep.line - 1;
        if (idx >= 0 && idx < lines.length) {
            const oldLine = lines[idx];
            lines[idx] = lines[idx].replace(rep.find, rep.replace);
            if (oldLine !== lines[idx]) {
                modified = true;
            }
        }
    });

    if (modified) {
        fs.writeFileSync(fullPath, lines.join(isCRLF ? '\r\n' : '\n'), 'utf8');
        console.log(`Updated lines in ${relPath}`);
    }
}

function replaceGlobal(relPath, replacements) {
    const fullPath = path.join(basePath, relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    replacements.forEach(rep => {
        content = content.split(rep.find).join(rep.replace);
    });

    if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated global in ${relPath}`);
    }
}

// 1. EmergencyBanner.jsx
replaceInFileByLine('client/src/components/common/EmergencyBanner.jsx', [
    { line: 42, find: 'Medirush is a hyperlocal', replace: 'QuickMeds is a hyperlocal' }
]);

// 2. Footer.jsx
replaceInFileByLine('client/src/components/common/Footer.jsx', [
    { line: 43, find: /Medirush/g, replace: 'QuickMeds' },
    { line: 109, find: /Medirush/g, replace: 'QuickMeds' },
    { line: 163, find: /Medirush/g, replace: 'QuickMeds' },
    { line: 183, find: /Medirush/g, replace: 'QuickMeds' }
]);

// 3. Navbar.jsx
replaceInFileByLine('client/src/components/common/Navbar.jsx', [
    { line: 104, find: 'Medirush', replace: 'QuickMeds' }
]);

// 4. AuthLayout.jsx
replaceInFileByLine('client/src/layouts/AuthLayout.jsx', [
    { line: 60, find: 'Medirush', replace: 'QuickMeds' }
]);

// 5. AdminPrescriptions.jsx
replaceInFileByLine('client/src/pages/admin/AdminPrescriptions.jsx', [
    { line: 36, find: 'Medirush', replace: 'QuickMeds' }
]);

// 6, 7, 8. Login.jsx
replaceInFileByLine('client/src/pages/auth/Login.jsx', [
    { line: 52, find: 'Sign In to Medirush', replace: 'Sign In to QuickMeds' },
    { line: 123, find: 'delivery1@medirush.in', replace: 'delivery1@quickmeds.in' },
    { line: 143, find: 'admin@medirush.in', replace: 'admin@quickmeds.in' }
]);

// 9. Register.jsx
replaceInFileByLine('client/src/pages/auth/Register.jsx', [
    { line: 76, find: 'Medirush', replace: 'QuickMeds' },
    { line: 94, find: 'Medirush', replace: 'QuickMeds' }
]);

// 10. MedicineDetail.jsx
replaceInFileByLine('client/src/pages/medicines/MedicineDetail.jsx', [
    { line: 200, find: 'Medirush', replace: 'QuickMeds' }
]);

// 11. About.jsx
replaceInFileByLine('client/src/pages/public/About.jsx', [
    { line: 9, find: 'Medirush', replace: 'QuickMeds' },
    { line: 20, find: 'Medirush', replace: 'QuickMeds' },
    { line: 22, find: 'Medirush', replace: 'QuickMeds' }
]);

// 12. Contact.jsx
replaceInFileByLine('client/src/pages/public/Contact.jsx', [
    { line: 23, find: 'Medirush', replace: 'QuickMeds' },
    { line: 35, find: 'MEDIRUSH', replace: 'QUICKMEDS' },
    { line: 43, find: 'medirush.in', replace: 'quickmeds.in' },
    { line: 52, find: 'medirush.in', replace: 'quickmeds.in' }
]);
replaceGlobal('client/src/pages/public/Contact.jsx', [
    { find: 'support@medirush.in', replace: 'support@quickmeds.in' },
    { find: 'business@medirush.in', replace: 'business@quickmeds.in' },
    { find: 'Medirush', replace: 'QuickMeds' },
    { find: 'MEDIRUSH', replace: 'QUICKMEDS' }
]);

// 13. Disclaimer.jsx
replaceInFileByLine('client/src/pages/public/Disclaimer.jsx', [
    { line: 38, find: 'Medirush', replace: 'QuickMeds' },
    { line: 39, find: 'Medirush', replace: 'QuickMeds' },
    { line: 62, find: 'Medirush', replace: 'QuickMeds' },
    { line: 85, find: 'Medirush', replace: 'QuickMeds' }
]);

// 14. Landing.jsx
replaceGlobal('client/src/pages/public/Landing.jsx', [
    { find: 'Medirush', replace: 'QuickMeds' }
]);

// 15. Privacy.jsx
replaceInFileByLine('client/src/pages/public/Privacy.jsx', [
    { line: 9, find: 'Medirush', replace: 'QuickMeds' }
]);

// 16. Safety.jsx
replaceInFileByLine('client/src/pages/public/Safety.jsx', [
    { line: 25, find: 'Medirush', replace: 'QuickMeds' },
    { line: 34, find: 'Medirush', replace: 'QuickMeds' }
]);

// 17. Terms.jsx
replaceInFileByLine('client/src/pages/public/Terms.jsx', [
    { line: 9, find: 'Medirush', replace: 'QuickMeds' }
]);

// LocalStorage Keys
// 18. AuthContext.jsx
replaceGlobal('client/src/context/AuthContext.jsx', [
    { find: 'medirush_user', replace: 'quickmeds_user' },
    { find: 'medirush_token', replace: 'quickmeds_token' }
]);

// 19. LocationContext.jsx
replaceGlobal('client/src/context/LocationContext.jsx', [
    { find: 'medirush_user_location', replace: 'quickmeds_user_location' }
]);

// 20. ThemeContext.jsx
replaceGlobal('client/src/context/ThemeContext.jsx', [
    { find: 'medirush_theme', replace: 'quickmeds_theme' }
]);

// 21. services/api.js
replaceGlobal('client/src/services/api.js', [
    { find: 'medirush_token', replace: 'quickmeds_token' },
    { find: 'medirush_user', replace: 'quickmeds_user' }
]);

// Backend
// 22. env.js
replaceInFileByLine('server/src/config/env.js', [
    { line: 21, find: 'medirush_super_secret_jwt_key_2026_hyperlocal', replace: 'quickmeds_super_secret_jwt_key_2026_hyperlocal' }
]);
replaceGlobal('server/src/config/env.js', [
    { find: 'medirush_super_secret', replace: 'quickmeds_super_secret' }
]);

// 23. adminController.js
replaceInFileByLine('server/src/controllers/adminController.js', [
    { line: 184, find: 'Medirush', replace: 'QuickMeds' }
]);

// 24. deliveryController.js
replaceInFileByLine('server/src/controllers/deliveryController.js', [
    { line: 117, find: 'Medirush', replace: 'QuickMeds' }
]);

// 25. orderController.js
replaceInFileByLine('server/src/controllers/orderController.js', [
    { line: 141, find: 'Medirush', replace: 'QuickMeds' }
]);

// 26. index.js
replaceInFileByLine('server/src/index.js', [
    { line: 69, find: 'Medirush', replace: 'QuickMeds' },
    { line: 104, find: 'MEDIRUSH', replace: 'QUICKMEDS' }
]);
replaceGlobal('server/src/index.js', [
    { find: 'Medirush', replace: 'QuickMeds' },
    { find: 'MEDIRUSH', replace: 'QUICKMEDS' }
]);

// 27. models/Medicine.js
replaceInFileByLine('server/src/models/Medicine.js', [
    { line: 99, find: 'Medirush', replace: 'QuickMeds' }
]);

// 28, 29. seed/seed.js
replaceInFileByLine('server/src/seed/seed.js', [
    { line: 41, find: 'admin@medirush.in', replace: 'admin@quickmeds.in' },
    { line: 103, find: 'delivery1@medirush.in', replace: 'delivery1@quickmeds.in' },
    { line: 129, find: 'delivery2@medirush.in', replace: 'delivery2@quickmeds.in' },
    { line: 471, find: 'MEDIRUSH', replace: 'QUICKMEDS' },
    { line: 475, find: 'MEDIRUSH', replace: 'QUICKMEDS' },
    { line: 480, find: 'medirush.in', replace: 'quickmeds.in' }
]);
replaceGlobal('server/src/seed/seed.js', [
    { find: 'admin@medirush.in', replace: 'admin@quickmeds.in' },
    { find: 'delivery1@medirush.in', replace: 'delivery1@quickmeds.in' },
    { find: 'delivery2@medirush.in', replace: 'delivery2@quickmeds.in' },
    { find: 'MEDIRUSH', replace: 'QUICKMEDS' },
    { find: 'medirush.in', replace: 'quickmeds.in' }
]);


// 30. client/index.html
replaceGlobal('client/index.html', [
    { find: '<title>Medirush — Hyperlocal Medicine Delivery</title>', replace: '<title>QuickMeds — Hyperlocal Medicine Delivery</title>' },
    { find: 'Medirush', replace: 'QuickMeds' }
]);

console.log("All replacements done.");
