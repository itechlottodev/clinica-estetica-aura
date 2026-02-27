export default class Modal {
  constructor(title, content, onSave) {
    this.title = title;
    this.content = content;
    this.onSave = onSave;
  }

  render() {
    return `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" id="modal-overlay">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-aura-beige px-6 py-4 flex justify-between items-center">
            <h2 class="text-2xl font-playfair text-aura-neutral">${this.title}</h2>
            <button id="modal-close" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <div class="p-6">
            ${this.content}
          </div>
          <div class="sticky bottom-0 bg-white border-t border-aura-beige px-6 py-4 flex justify-end gap-3">
            <button id="modal-cancel" class="aura-btn-secondary">Cancelar</button>
            <button id="modal-save" class="aura-btn-primary">Salvar</button>
          </div>
        </div>
      </div>
    `;
  }

  show() {
    const container = document.getElementById('modal-container');
    if (!container) {
      const div = document.createElement('div');
      div.id = 'modal-container';
      document.body.appendChild(div);
    }

    document.getElementById('modal-container').innerHTML = this.render();

    document.getElementById('modal-close').addEventListener('click', () => this.close());
    document.getElementById('modal-cancel').addEventListener('click', () => this.close());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.close();
    });

    if (this.onSave) {
      document.getElementById('modal-save').addEventListener('click', () => {
        this.onSave();
      });
    }
  }

  close() {
    const container = document.getElementById('modal-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  static close() {
    const container = document.getElementById('modal-container');
    if (container) {
      container.innerHTML = '';
    }
  }
}
