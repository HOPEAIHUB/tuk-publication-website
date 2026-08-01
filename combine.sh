#!/bin/bash
# Combine all files into a self-contained HTML for deployment
CSS=$(cat css/styles.css)
JS_THEME=$(cat js/theme.js)
JS_MAIN=$(cat js/main.js)

# For each HTML file, inline CSS and JS
for f in index.html about.html services.html community.html contact.html; do
  # Replace CSS link with inline style
  sed "s|<link rel=\"stylesheet\" href=\"css/styles.css\">|<style>\n${CSS}\n</style>|" "$f" > "deploy_${f}"
  # Replace JS scripts with inline scripts
  sed -i "s|<script src=\"js/theme.js\"></script>|<script>\n${JS_THEME}\n</script>|" "deploy_${f}"
  sed -i "s|<script src=\"js/main.js\"></script>|<script>\n${JS_MAIN}\n</script>|" "deploy_${f}"
  echo "Created deploy_${f}"
done
