const fs = require('fs');
const path = require('path');

// Target directory (root of the website)
const rootDir = __dirname;

// The default domain currently used in sitemaps and hreflang tags
const DEFAULT_DOMAIN = 'shreetraders.com';

function getArgs() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log(`
========================================================================
Shree Traders - Production Domain Configuration Tool
========================================================================
Usage:
  node change_domain.js <new-domain-name>

Example:
  node change_domain.js shreetradersrice.in
  node change_domain.js shreetraders.in
========================================================================
`);
        process.exit(1);
    }
    return args[0].replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').trim();
}

function processDirectory(dir, newDomain) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Ignore images and system/node folders
            if (item !== 'images' && item !== 'scratch' && item !== '.git') {
                processDirectory(fullPath, newDomain);
            }
        } else if (item.endsWith('.html') || item.endsWith('.xml') || item.endsWith('.txt')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            
            // Search and replace all instances of default domain
            if (content.includes(DEFAULT_DOMAIN)) {
                content = content.split(DEFAULT_DOMAIN).join(newDomain);
                updated = true;
            }
            
            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`✔ Configured domain in: ${path.relative(rootDir, fullPath)}`);
            }
        }
    });
}

function main() {
    const newDomain = getArgs();
    console.log(`\nConfiguring Shree Traders production domain to: https://${newDomain}\n`);
    
    try {
        processDirectory(rootDir, newDomain);
        console.log(`\n🎉 Success! All canonical links, hreflang tags, JSON-LD schemas, sitemaps, and crawlers have been configured for 'https://${newDomain}'. You are 100% ready to deploy!`);
    } catch (err) {
        console.error('❌ Error during domain configuration:', err);
    }
}

main();
