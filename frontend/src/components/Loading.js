export const Loading = {
  show() {
    const existingLoading = document.getElementById('global-loading');
    if (existingLoading) return;

    const loadingHTML = `
      <div id="global-loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-lightpink"></div>
          <p class="text-gray-700 font-medium">Processando...</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  },

  hide() {
    const loading = document.getElementById('global-loading');
    if (loading) {
      loading.remove();
    }
  },

  showButton(buttonElement) {
    if (!buttonElement) return;
    
    buttonElement.disabled = true;
    buttonElement.dataset.originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = `
      <div class="flex items-center justify-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Processando...</span>
      </div>
    `;
  },

  hideButton(buttonElement) {
    if (!buttonElement || !buttonElement.dataset.originalText) return;
    
    buttonElement.disabled = false;
    buttonElement.innerHTML = buttonElement.dataset.originalText;
    delete buttonElement.dataset.originalText;
  }
};
