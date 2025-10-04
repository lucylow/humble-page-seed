export function detectFrameworkFromFilename(filename, content='') {
  if (filename.includes('.vue') || content.includes('Vue')) return 'vue';
  if (filename.includes('.svelte') || content.includes('svelte')) return 'svelte';
  if (filename.includes('.jsx') || content.includes('React')) return 'react';
  return 'generic';
}
