import en from './locale/en';
import loadBlocks from './blocks';
import loadCommands from './commands';

export default (editor, opts = {}) => {
  const options = {
    ...{
      i18n: {},
      // default options
      blocks: false,
      tailwindPlayCdn: 'https://cdn.tailwindcss.com',
      plugins: [],
      config: {},
      changeThemeText: 'Change Theme',
      openCategory: 'Blog',
    }, ...opts
  };
  if (options.blocks) {
    // Add blocks
    loadBlocks(editor, options);
  }
  // Add commands
  loadCommands(editor, options);
  // Load i18n files
  editor.I18n && editor.I18n.addMessages({
    en,
    ...options.i18n,
  });

  const appendTailwindCss = async (frame) => {
    const iframe = frame.view.getEl();

    if (!iframe) return;

    const { tailwindPlayCdn, plugins, config, cover } = options;
    const init = () => {
      iframe.contentWindow.tailwind.config = config;
    }

    const script = document.createElement('script');
    script.src = tailwindPlayCdn + (plugins.length ? `?plugins=${plugins.join()}` : '');
    script.onload = init;

    const cssStyle = document.createElement('style');

    // checks iframe is ready before loading Tailwind CSS - issue with firefox
    const f = setInterval(() => {
      const doc = iframe.contentDocument;
      if (doc && doc.readyState && doc.readyState === 'complete') {
        doc.head.appendChild(script);
        doc.head.appendChild(cssStyle);
        clearInterval(f);
      }
    }, 100)
  }

  editor.Canvas.getModel()['on']('change:frames', (m, frames) => {
    frames.forEach(frame => frame.once('loaded', () => appendTailwindCss(frame)));
  });
};
