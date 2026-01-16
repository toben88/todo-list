<?php
// Auto-install script for Todo App
// Run once after deployment to configure .htaccess

$basePath = dirname($_SERVER['SCRIPT_NAME']) . '/';

$htaccess = "<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase {$basePath}
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . {$basePath}index.html [L]
</IfModule>";

if (file_put_contents('.htaccess', $htaccess)) {
    echo "Success! .htaccess configured for: {$basePath}<br>";
    echo "You can now delete this install.php file.";
    // Optionally auto-delete: unlink(__FILE__);
} else {
    echo "Error: Could not write .htaccess file. Check folder permissions.";
}
?>
