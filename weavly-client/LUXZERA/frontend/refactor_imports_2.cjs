const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const allFiles = walk(srcDir);

const replacements = [
  { from: /@\/modules\/core\//g, to: '@/modules/system/' },
  { from: /@\/modules\/account\//g, to: '@/modules/profile/' },
  { from: /@\/modules\/shop\//g, to: '@/modules/products/' },
  { from: /@\/modules\/auth\/context/g, to: '@/modules/auth/store' },
  { from: /@\/modules\/cart\/context/g, to: '@/modules/cart/store' },
  { from: /@\/modules\/wishlist\/context/g, to: '@/modules/wishlist/store' },
  { from: /@\/modules\/auth\/services\/auth/g, to: '@/modules/auth/services' },
  { from: /@\/modules\/products\/services\/products/g, to: '@/modules/products/services' },
  { from: /@\/modules\/shop\/services\/search/g, to: '@/modules/products/services' }, // catch old shop imports
  { from: /@\/modules\/products\/services\/search/g, to: '@/modules/products/services' },
  { from: /@\/modules\/account\/services\/users/g, to: '@/modules/profile/services' },
  { from: /@\/modules\/profile\/services\/users/g, to: '@/modules/profile/services' },
];

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(({from, to}) => {
    content = content.replace(from, to);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

// Regenerate barrel files
const barrelExports = {
  'modules/auth': ['pages/CompleteGoogleSignupPage.jsx', 'pages/ForgotPasswordPage.jsx', 'pages/VerifyOtpPage.jsx', 'pages/RegisterPage.jsx', 'components/AuthModal.jsx', 'components/LoginModal.jsx', 'store/AuthContext.jsx', 'store/useAuth.js', 'store/useCurrentUser.js'],
  'modules/products': ['pages/ProductDetailPage.jsx', 'pages/ShopPage.jsx', 'pages/MenPage.jsx', 'pages/WomenPage.jsx', 'pages/KidsPage.jsx', 'pages/UnisexPage.jsx', 'pages/MarketPage.jsx', 'components/ProductCard.jsx', 'components/MobileProductCard.jsx', 'components/MobileProductDetail.jsx', 'components/ProductGallery.jsx', 'components/ProductAccordion.jsx', 'components/ProductReviews.jsx', 'components/ReviewForm.jsx', 'components/FiltersSidebar.jsx', 'components/RelatedProducts.jsx'],
  'modules/cart': ['pages/CartPage.jsx', 'store/CartContext.jsx'],
  'modules/wishlist': ['pages/WardrobePage.jsx', 'store/WardrobeContext.jsx'],
  'modules/profile': ['pages/AccountPage.jsx', 'pages/OrdersPage.jsx'],
  'modules/system': ['pages/FaqPage.jsx', 'pages/AboutPage.jsx', 'pages/PrivacyPolicyPage.jsx', 'pages/NotFoundPage.jsx'],
};

for (const [mod, files] of Object.entries(barrelExports)) {
  const barrelPath = path.join(srcDir, mod, 'index.js');
  if (fs.existsSync(barrelPath) || fs.existsSync(path.dirname(barrelPath))) {
    const barrelContent = files.map(file => {
      const name = path.basename(file, '.jsx').replace('.js', '');
      return `export { default as ${name} } from './${file}';\nexport * from './${file}';`;
    }).join('\n\n');
    fs.writeFileSync(barrelPath, barrelContent, 'utf8');
  }
}

// Clean up old barrel files if they exist
const oldBarrels = [
  path.join(srcDir, 'modules/core/index.js'),
  path.join(srcDir, 'modules/account/index.js'),
  path.join(srcDir, 'modules/shop/index.js')
];
oldBarrels.forEach(barrel => {
  if (fs.existsSync(barrel)) fs.unlinkSync(barrel);
});

console.log("Imports updated and barrel files regenerated.");
