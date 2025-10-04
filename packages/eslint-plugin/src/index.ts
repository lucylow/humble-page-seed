export const rules = {
  'baseline': {
    meta: { type: 'problem', docs: { description: 'Disallow features not in baseline' } },
    create(context) {
      return {
        CallExpression(node) {
          try {
            const name = context.getSourceCode().getText(node.callee);
            if (name.includes('IntersectionObserver')) {
              context.report({ node, message: 'IntersectionObserver may not meet the baseline target' });
            }
          } catch (e) {}
        }
      };
    }
  }
};

export default { rules, configs: { recommended: { plugins: ['compatguard'], rules: { 'compatguard/baseline': 'warn' } } } };
