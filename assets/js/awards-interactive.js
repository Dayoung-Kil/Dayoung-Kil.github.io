// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Select all award titles
  const awardTitles = document.querySelectorAll('.award-title');
  
  // Add click event listeners to each award title
  awardTitles.forEach(title => {
    title.addEventListener('click', function() {
      // Get the parent panel
      const panel = this.parentElement;
      
      // Get the description element
      const description = panel.querySelector('.award-description');
      const host = panel.querySelector('.award-host');
      
      // Create a modal popup for the award details
      const modal = document.createElement('div');
      modal.className = 'award-panel';
      
      // Create close button
      const closeButton = document.createElement('span');
      closeButton.className = 'close-panel';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', function() {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
        }, 300);
      });
      
      // Create title for the modal
      const modalTitle = document.createElement('h3');
      modalTitle.textContent = this.textContent;
      modalTitle.className = 'modal-title';
      
      // Add host info if it exists
      let modalContent = '';
      if (host) {
        const hostClone = document.createElement('div');
        hostClone.className = 'award-host';
        hostClone.innerHTML = host.innerHTML;
        modal.appendChild(hostClone);
      }
      
      // Add description to the modal
      const descriptionClone = document.createElement('div');
      descriptionClone.className = 'award-description';
      descriptionClone.innerHTML = description.innerHTML;
      
      // Add elements to the modal
      modal.appendChild(closeButton);
      modal.appendChild(modalTitle);
      modal.appendChild(descriptionClone);
      
      // Clear any existing modals
      const existingModals = panel.querySelectorAll('.award-panel');
      existingModals.forEach(existing => existing.remove());
      
      // Add the modal to the panel
      panel.appendChild(modal);
      
      // Show the modal with a slight delay for better animation
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
      
      // Toggle the active class on the title
      this.classList.toggle('active');
    });
  });
  
  // Close modals when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.award-panel') && !event.target.closest('.award-title')) {
      const activePanels = document.querySelectorAll('.award-panel.active');
      const activeTitles = document.querySelectorAll('.award-title.active');
      
      activePanels.forEach(panel => {
        panel.classList.remove('active');
        setTimeout(() => {
          panel.remove();
        }, 300);
      });
      
      activeTitles.forEach(title => {
        title.classList.remove('active');
      });
    }
  });
});
