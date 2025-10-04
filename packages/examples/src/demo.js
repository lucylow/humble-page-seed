import { CompatGuardLinter } from '@compatguard/core';

async function runDemo() {
  const l = new CompatGuardLinter('2024');
  await l.initialize();
  const res = await l.lintCode("const obs = new IntersectionObserver(()=>{});\n.container:has(.active){ color: red; }", 'javascript');
  console.log('Demo diagnostics:', res.diagnostics);
}

runDemo().catch(console.error);
