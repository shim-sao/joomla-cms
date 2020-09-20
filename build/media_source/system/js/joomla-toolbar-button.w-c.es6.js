/**
 * @copyright  Copyright (C) 2005 - 2020 Open Source Matters, Inc. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

window.customElements.define('joomla-toolbar-button', class extends HTMLElement {
  // Attribute getters
  get task() { return this.getAttribute('task'); }

  get listSelection() { return this.hasAttribute('list-selection'); }

  get form() { return this.getAttribute('form'); }

  get formValidation() { return this.hasAttribute('form-validation'); }

  get confirmMessage() { return this.getAttribute('confirm-message'); }

  /**
   * Lifecycle
   */
  constructor() {
    super();

    if (!Joomla) {
      throw new Error('Joomla API is not properly initiated');
    }

    this.onChange = this.onChange.bind(this);
    this.executeTask = this.executeTask.bind(this);
  }

  /**
   * Lifecycle
   */
  connectedCallback() {
    // We need a button to support button behavior,
    // because we cannot currently extend HTMLButtonElement
    this.buttonElement = this.querySelector('button, a');

    this.buttonElement.addEventListener('click', this.executeTask);

    // Check whether we have a form
    const formSelector = this.form || 'adminForm';
    this.formElement = document.getElementById(formSelector);

    this.disabled = false;
    // If list selection is required, set button to disabled by default
    if (this.listSelection) {
      this.setDisabled(true);
    }

    if (this.listSelection) {
      if (!this.formElement) {
        throw new Error(`The form "${formSelector}" is required to perform the task, but the form was not found on the page.`);
      }

      // Watch on list selection
      this.formElement.boxchecked.addEventListener('change', this.onChange);
    }
  }

  /**
   * Lifecycle
   */
  disconnectedCallback() {
    if (this.formElement.boxchecked) {
      this.formElement.boxchecked.removeEventListener('change', this.onChange);
    }

    this.buttonElement.removeEventListener('click', this.executeTask);
  }

  onChange({ target }) {
    // Check whether we have selected something
    this.setDisabled(target.value < 1);
  }

  setDisabled(disabled) {
    // Make sure we have a boolean value
    this.disabled = !!disabled;

    // Switch attribute for native element
    // An anchor does not support "disabled" attribute, so use class
    if (this.buttonElement) {
      if (this.disabled) {
        if (this.buttonElement.nodeName === 'BUTTON') {
          this.buttonElement.disabled = true;
        } else {
          this.buttonElement.classList.add('disabled');
        }
      } else if (this.buttonElement.nodeName === 'BUTTON') {
        this.buttonElement.disabled = false;
      } else {
        this.buttonElement.classList.remove('disabled');
      }
    }
  }

  executeTask() {
    if (this.disabled) {
      return false;
    }

    // Avoid multiple call to the task like accidental double-click
    this.disabled = true;

    // eslint-disable-next-line no-restricted-globals
    if (this.confirmMessage && !confirm(this.confirmMessage)) {
      return false;
    }

    if (this.task) {
      Joomla.submitbutton(this.task, this.form, this.formValidation);
    }

    // Enable call to task again after its execution
    this.disabled = false;

    return true;
  }
});
