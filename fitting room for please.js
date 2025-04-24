document.addEventListener('DOMContentLoaded', function () {
    const avatarContainers = document.querySelectorAll('ul.fitting-list li.fitting-avatar div.fitting-avatar-bg');
    const initialAvatar = typeof UserAvatar !== 'undefined' ? UserAvatar : '';
    if (initialAvatar) {
        avatarContainers.forEach(container => {
            const img = document.createElement('img');
            img.src = initialAvatar;
            img.style.cursor = 'pointer';
            container.innerHTML = '';
            container.appendChild(img);

            img.addEventListener('click', function (e) {
                e.stopPropagation();
                openAvatarEditor(img);
            });
        });
    }

    function openAvatarEditor(imgElement) {
        const existingModal = document.querySelector('.edit-modal.avatar-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'edit-modal avatar-modal';
        Object.assign(modal.style, {
            position: 'fixed',
            zIndex: '10000',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 0 15px rgba(0,0,0,0.5)',
            width: '350px'
        });

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'Введите URL изображения';
        urlInput.value = imgElement.src;
        Object.assign(urlInput.style, {
            width: '96%',
            marginBottom: '5px',
            padding: '4px',
            background: '#d9e4f5',
            outline: 'none',
            border: 'none',
            font: '400 11px mulish',
            borderRadius: '5px'
        });

        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '15px'
        });


        const defaultButton = createModalButton('по умолчанию', () => {
            urlInput.value = initialAvatar;
            imgElement.src = initialAvatar;
            UserAvatar = initialAvatar;
            showTempMessage(defaultButton, 'установлено!');
        });


        const applyButton = createModalButton('применить', () => {
            imgElement.src = urlInput.value;
            UserAvatar = urlInput.value;
            document.body.removeChild(modal);
        }, '#4379cf33', 'black');

        const cancelButton = createModalButton('отмена', () => {
            document.body.removeChild(modal);
        }, '#4379cf33', 'black');

        buttonContainer.append(defaultButton, applyButton, cancelButton);
        modal.append(urlInput, buttonContainer);
        document.body.appendChild(modal);

        urlInput.focus();
        urlInput.select();

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    function createModalButton(text, onClick, bgColor = '#e0e0e0', textColor = 'black') {
        const button = document.createElement('button');
        button.textContent = text;
        Object.assign(button.style, {
            padding: '5px 10px',
            cursor: 'pointer',
            border: 'none',
            font: '400 11px mulish',
            backgroundColor: bgColor,
            color: textColor,
            borderRadius: '5px'
        });
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            onClick();
        });
        return button;
    }

    function showTempMessage(element, message) {
        const originalText = element.textContent;
        element.textContent = message;
        setTimeout(() => {
            element.textContent = originalText;
        }, 2000);
    }
});



// дальше ник

const usernameSpans = document.querySelectorAll('.fitting-item a');

if (typeof UserLogin !== 'undefined') {
    usernameSpans.forEach(a => {
        a.textContent = UserLogin;
    });
}

// дальше ЛЗ

document.addEventListener('DOMContentLoaded', function () {
    const fittingContentBlocks = document.querySelectorAll('.fitting-content');

    if (typeof UserFld3 !== 'undefined') {
        const decodedHTML = new DOMParser()
            .parseFromString(UserFld3, 'text/html')
            .documentElement.textContent;

        fittingContentBlocks.forEach(block => {
            block.innerHTML = decodedHTML;
            block.style.position = 'relative';
            block.style.cursor = 'pointer';
            block.addEventListener('click', (e) => {
                if (!e.target.closest('.edit-modal') && !e.target.closest('.prof-icon')) {
                    e.stopPropagation();
                    openEditModal(block, block.innerHTML);
                }
            });
        });
    }

    function openEditModal(targetElement, currentHTML) {
        const existingModal = targetElement.querySelector('.edit-modal');
        if (existingModal) {
            targetElement.removeChild(existingModal);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'edit-modal';

        const parentRect = targetElement.getBoundingClientRect();
        modal.style.left = '230px';
        modal.style.top = '0';

        const contentWrapper = document.createElement('div');
        contentWrapper.style.pointerEvents = 'none';

        const textarea = document.createElement('textarea');

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentHTML;

        const profIcons = tempDiv.querySelectorAll('img.prof-icon');
        profIcons.forEach(icon => icon.remove());

        textarea.value = tempDiv.innerHTML;

        contentWrapper.appendChild(textarea);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '10px';
        buttonContainer.style.pointerEvents = 'auto';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Копировать';
        copyButton.style.marginRight = 'auto';
        copyButton.onclick = (e) => {
            e.stopPropagation();
            textarea.select();
            document.execCommand('copy');

            const originalText = copyButton.textContent;
            copyButton.textContent = 'Скопировано!';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2000);
        };

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Применить';
        saveButton.onclick = (e) => {
            e.stopPropagation();
            targetElement.innerHTML = textarea.value;
            targetElement.appendChild(modal);
        };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Отмена';
        cancelButton.style.marginLeft = '10px';
        cancelButton.onclick = (e) => {
            e.stopPropagation();
            targetElement.removeChild(modal);
        };

        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(cancelButton);
        contentWrapper.appendChild(buttonContainer);
        modal.appendChild(contentWrapper);

        targetElement.appendChild(modal);

        let isDragging = false;
        let offsetX, offsetY;

        modal.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
                return;
            }

            const rect = modal.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            isDragging = true;
            modal.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            modal.style.left = `${e.clientX - offsetX - targetElement.getBoundingClientRect().left}px`;
            modal.style.top = `${e.clientY - offsetY - targetElement.getBoundingClientRect().top}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            modal.style.cursor = 'move';
        });
    }
});

// дальше иконка 

document.addEventListener('DOMContentLoaded', function () {
    function ensureProfIconExists() {
        document.querySelectorAll('li.pa-fld3.fitting-content').forEach(container => {
            if (!container.querySelector('img.prof-icon')) {
                const img = document.createElement('img');
                img.className = 'prof-icon';
                img.src = 'https://i.imgur.com/e5wUtvI.png';

                container.appendChild(img);

                img.addEventListener('click', function (e) {
                    e.stopPropagation();
                    openImageEditor(this);
                });
            }
        });
    }

    function setupBankIcons() {
        document.querySelectorAll('.pls-bank-icons div img').forEach(img => {
            if (!img.hasAttribute('data-icon-handler')) {
                img.style.cursor = 'pointer';
                img.setAttribute('data-icon-handler', 'true');
                img.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const targetImg = document.querySelector('.fitting-content img.prof-icon');
                    if (targetImg) {
                        targetImg.src = this.src;
                    }
                });
            }
        });
    }

    function setupTargetIcon() {
        const targetImg = document.querySelector('.fitting-content img.prof-icon');
        if (targetImg && !targetImg.hasAttribute('data-edit-handler')) {
            targetImg.style.cursor = 'pointer';
            targetImg.setAttribute('data-edit-handler', 'true');
            targetImg.addEventListener('click', function (e) {
                e.stopPropagation();
                openImageEditor(this);
            });
        }
    }

    setTimeout(() => {
        ensureProfIconExists();
        setupBankIcons();
        setupTargetIcon();

        const observer = new MutationObserver(() => {
            ensureProfIconExists();
            setupBankIcons();
            setupTargetIcon();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }, 100);

    function openImageEditor(imgElement) {
        const existingModal = document.querySelector('.image-edit-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.className = 'image-edit-modal';
        Object.assign(modal.style, {
            position: 'fixed',
            zIndex: '10000',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 0 15px rgba(0,0,0,0.5)',
            width: '350px'
        });

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'Введите URL изображения';
        urlInput.value = imgElement.src;
        Object.assign(urlInput.style, {
            width: '96%',
            marginBottom: '5px',
            padding: '4px',
            background: '#d9e4f5',
            outline: 'none',
            border: 'none',
            font: '400 11px mulish',
            borderRadius: '5px'
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginTop = '15px';

        const copyButton = createModalButton('копировать код', () => {
            const htmlCode = `<img src="${urlInput.value}" class="prof-icon">`;
            navigator.clipboard.writeText(htmlCode)
                .then(() => {
                    showTempMessage(copyButton, 'скопировано!');
                });
        }, '#f0f0f0');

        const applyButton = createModalButton('применить', () => {
            imgElement.src = urlInput.value;
            document.body.removeChild(modal);
        }, '#4379cf33', 'black');

        const cancelButton = createModalButton('отмена', () => {
            document.body.removeChild(modal);
        }, '#4379cf33', 'black');

        buttonContainer.append(copyButton, applyButton, cancelButton);
        modal.append(urlInput, buttonContainer);
        document.body.appendChild(modal);

        urlInput.focus();
        urlInput.select();

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    function createModalButton(text, onClick, bgColor = '#e0e0e0', textColor = 'black') {
        const button = document.createElement('button');
        button.textContent = text;
        Object.assign(button.style, {
            padding: '5px 10px',
            cursor: 'pointer',
            border: 'none',
            font: '400 11px mulish',
            backgroundColor: bgColor,
            color: textColor,
            borderRadius: '5px'
        });
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            onClick();
        });
        return button;
    }

    function showTempMessage(element, message) {
        const originalText = element.textContent;
        element.textContent = message;
        setTimeout(() => {
            element.textContent = originalText;
        }, 2000);
    }

    setTimeout(() => {
        setupBankIcons();
        setupTargetIcon();

        const observer = new MutationObserver(() => {
            setupBankIcons();
            setupTargetIcon();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }, 100);
});


document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.pls-bank-stickers img').forEach(sticker => {
        sticker.style.cursor = 'pointer';
        sticker.addEventListener('click', function () {
            const target = document.querySelector('.fitting-header img.prof-sticker');
            target.src = this.src;
            target.style.display = 'block';
        });
    });

    const profSticker = document.querySelector('.fitting-header img.prof-sticker');
    if (profSticker) {
        profSticker.style.cursor = 'pointer';
        profSticker.addEventListener('click', function () {
            if (!this.src) return;

            const code = `<img src="${this.src}" class="prof-sticker">`;
            navigator.clipboard.writeText(code).then(() => {
                const notification = document.createElement('div');
                notification.textContent = 'Код скопирован!';
                notification.style.position = 'fixed';
                notification.style.top = '20px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
                notification.style.color = 'white';
                notification.style.padding = '10px 20px';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '1000';
                notification.style.animation = 'fadeOut 1s ease 1s forwards';

                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 2000);
            });
        });
    }
});


// дальше хэдер и футер

document.addEventListener('DOMContentLoaded', function () {


    function createModalButton(text, onClick, background = '#eee', color = 'black') {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.padding = '5px 10px';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.backgroundColor = background;
        btn.style.color = color;
        btn.style.cursor = 'pointer';
        btn.style.font = '400 11px mulish';
        btn.addEventListener('click', onClick);
        return btn;
    }


    function createImageModal(imgElement, className, description) {
        const existingModal = document.querySelector('.image-edit-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');

        const descriptionText = document.createElement('div');
        descriptionText.textContent = description;
        Object.assign(descriptionText.style, {
            font: '400 12px mulish',
            marginBottom: '10px',
            color: '#333'
        });
        modal.appendChild(descriptionText);

        modal.className = 'image-edit-modal';
        Object.assign(modal.style, {
            position: 'fixed',
            zIndex: '10000',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 0 15px rgba(0,0,0,0.5)',
            width: '350px'
        });

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'Введите URL изображения';
        urlInput.value = imgElement.src;
        Object.assign(urlInput.style, {
            width: '96%',
            marginBottom: '5px',
            padding: '5px 10px',
            background: '#d9e4f5',
            outline: 'none',
            border: 'none',
            font: '400 11px mulish',
            borderRadius: '5px'
        });

        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '5px'
        });

        const copyButton = createModalButton('копировать код', () => {
            const htmlCode = `<img src="${urlInput.value}" class="${className}">`;
            navigator.clipboard.writeText(htmlCode)
                .then(() => showTempMessage(copyButton, 'скопировано!'));
        }, '#f0f0f0');

        const applyButton = createModalButton('применить', () => {
            imgElement.src = urlInput.value;
            document.body.removeChild(modal);
        }, '#4379cf33', 'black');

        const cancelButton = createModalButton('отмена', () => {
            document.body.removeChild(modal);
        }, '#4379cf33', 'black');

        buttonContainer.append(copyButton, applyButton, cancelButton);
        modal.append(urlInput, buttonContainer);
        document.body.appendChild(modal);

        urlInput.focus();
        urlInput.select();

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    document.querySelectorAll('.pls-bank-headers-footers > div > div').forEach(container => {
        container.style.position = 'relative';
        container.style.cursor = 'pointer';

        const headerBtn = createActionButton('хэдер', 'top');
        const footerBtn = createActionButton('футер', 'bottom');

        container.appendChild(headerBtn);
        container.appendChild(footerBtn);

        container.addEventListener('mouseenter', () => {
            headerBtn.style.opacity = '1';
            footerBtn.style.opacity = '1';
        });

        container.addEventListener('mouseleave', () => {
            headerBtn.style.opacity = '0';
            footerBtn.style.opacity = '0';
        });

        headerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const img = container.querySelector('img');
            if (img) {
                const target = document.querySelector('.fitting-header img.prof-header');
                if (target) {
                    target.src = img.src;
                    target.style.display = 'block';
                }
            }
        });

        footerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const img = container.querySelector('img');
            if (img) {
                const target = document.querySelector('.fitting-footer img.prof-footer');
                if (target) {
                    target.src = img.src;
                    target.style.display = 'block';
                }
            }
        });
    });

    const fittingHeader = document.querySelector('.fitting-header');
    if (fittingHeader) {
        fittingHeader.style.cursor = 'pointer';
        fittingHeader.addEventListener('click', function (e) {
            if (!e.target.closest('img.prof-header')) {
                openHeaderEditor(this);
            }
        });
    }

    const profHeader = document.querySelector('.fitting-header img.prof-header');
    if (profHeader) {
        profHeader.style.cursor = 'pointer';
        profHeader.addEventListener('click', function (e) {
            e.stopPropagation();
            createImageModal(this, 'prof-header', 'Ссылка на картинку для хедера');
        });
    }

    const fittingFooter = document.querySelector('.fitting-footer');
    if (fittingFooter) {
        fittingFooter.style.cursor = 'pointer';
        fittingFooter.addEventListener('click', function (e) {
            if (!e.target.closest('img.prof-footer') && !e.target.closest('.edit-modal')) {
                openFooterEditor(this);
            }
        });
    }

    const profFooter = document.querySelector('.fitting-footer img.prof-footer');
    if (profFooter) {
        profFooter.style.cursor = 'pointer';
        profFooter.addEventListener('click', function (e) {
            e.stopPropagation();
            createImageModal(this, 'prof-footer', 'Ссылка на картинку для футера');
        });
    }

    function createActionButton(text, position) {
        const btn = document.createElement('div');
        btn.textContent = text;
        btn.style.position = 'absolute';
        btn.style.left = '0';
        btn.style.right = '0';
        btn.style[position] = '0';
        btn.style.background = 'rgba(70, 69, 69, 0.7)';
        btn.style.color = 'white';
        btn.style.padding = '5px';
        btn.style.textAlign = 'center';
        btn.style.boxSizing = 'border-box';
        btn.style.cursor = 'pointer';
        btn.style.font = '400 12px mulish';
        btn.style.opacity = '0';
        btn.style.height = '30px';
        btn.style.transition = 'opacity 0.3s ease';
        btn.style.zIndex = '3';
        return btn;
    }

    function showTempMessage(element, message) {
        const originalText = element.textContent;
        element.textContent = message;
        setTimeout(() => element.textContent = originalText, 2000);
    }

    function openFooterEditor(targetFooter) {
        const existingModal = targetFooter.querySelector('.edit-modal');
        if (existingModal) {
            targetFooter.removeChild(existingModal);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.style.position = 'absolute';
        modal.style.zIndex = '1000';
        modal.style.backgroundColor = 'white';
        modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        modal.style.padding = '10px';
        modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        modal.style.borderRadius = '5px';
        modal.style.top = '-80px';
        modal.style.width = '300px';
        modal.style.boxSizing = 'border-box';
        modal.style.cursor = 'move';

        const plaque = targetFooter.querySelector('.fitting-plaque');
        const currentText = cleanHtml(plaque.innerHTML);

        const textarea = document.createElement('textarea');
        textarea.value = currentText;
        textarea.style.width = '100%';
        textarea.style.height = '100px';
        textarea.style.marginBottom = '10px';
        modal.appendChild(textarea);

        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Цвет фона:';
        colorLabel.style.display = 'block';
        colorLabel.style.marginBottom = '5px';
        modal.appendChild(colorLabel);

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.style.width = '100%';
        colorInput.style.marginBottom = '10px';

        const currentRGB = getRgbComponents(plaque.style.backgroundColor || 'rgb(255,255,255)');
        colorInput.value = rgbToHex(currentRGB);

        colorInput.addEventListener('input', () => {
            plaque.style.backgroundColor = hexToRgb(colorInput.value);
        });

        modal.appendChild(colorInput);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '10px';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Копировать';
        copyButton.onclick = function (e) {
            e.stopPropagation();
            const clone = plaque.cloneNode(true);
            Array.from(clone.querySelectorAll('p')).forEach(p => {
                p.removeAttribute('style');
            });
            const outerHTML = clone.outerHTML;
            navigator.clipboard.writeText(outerHTML).then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Скопировано!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            });
        };

        const applyButton = document.createElement('button');
        applyButton.textContent = 'Применить';
        applyButton.onclick = function (e) {
            e.stopPropagation();
            const paragraphs = textarea.value
                .split('\n')
                .map(line => line.trim().replace(/<\/?p[^>]*>/g, ''))
                .filter(line => line !== '')
                .map(line => `<p>${line}</p>`)
                .join('');

            plaque.innerHTML = paragraphs;
            plaque.style.backgroundColor = hexToRgb(colorInput.value);
        };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Отмена';
        cancelButton.onclick = function (e) {
            e.stopPropagation();
            targetFooter.removeChild(modal);
        };

        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(applyButton);
        buttonContainer.appendChild(cancelButton);
        modal.appendChild(buttonContainer);

        targetFooter.appendChild(modal);

        let isDragging = false;
        let offsetX, offsetY;

        modal.addEventListener('mousedown', function (e) {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
                return;
            }

            isDragging = true;
            offsetX = e.clientX - modal.getBoundingClientRect().left;
            offsetY = e.clientY - modal.getBoundingClientRect().top;
            modal.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;

            modal.style.left = `${e.clientX - offsetX - targetFooter.getBoundingClientRect().left}px`;
            modal.style.top = `${e.clientY - offsetY - targetFooter.getBoundingClientRect().top}px`;
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
            modal.style.cursor = 'default';
        });
    }

    function cleanHtml(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        Array.from(tempDiv.querySelectorAll('p')).forEach(p => {
            p.removeAttribute('style');
        });

        return tempDiv.innerHTML.replace(/<\/?p[^>]*>/g, match => {
            return match.startsWith('<p') ? '<p>' : '</p>';
        });
    }

    function getRgbComponents(rgbStr) {
        const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgbStr);
        if (result) {
            return {
                r: parseInt(result[1]),
                g: parseInt(result[2]),
                b: parseInt(result[3])
            };
        }
        return { r: 255, g: 255, b: 255 };
    }

    function rgbToHex({ r, g, b }) {
        return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgb(${r}, ${g}, ${b})`;
    }

    const content = document.querySelector('.fitting-list .fitting-content');
    const list = document.querySelector('.fitting-list');

    if (content && list) {
        content.addEventListener('mouseenter', () => {
            list.classList.add('hover-child');
        });

        content.addEventListener('mouseleave', () => {
            list.classList.remove('hover-child');
        });
    }
});

// для цифры сообщений

setTimeout(() => {
    document.querySelectorAll('.pa-posts.fitting-item').forEach(el => {
        if (el.textContent.trim() === 'undefined') el.innerHTML = '<img src="https://forumstatic.ru/files/001c/17/73/14544.svg" alt="Сообщений" style="height: 16px; vertical-align: middle;">999';
    });
}, 1000);

