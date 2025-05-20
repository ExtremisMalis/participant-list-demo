window.__changed = {
    bg: false,
    icon: false,
    plaqueText: false,
    plaqueColor: false,
    avatar: false,
    username: false
};

window.userInitialColor = '#D4623E';
window.initialState = {};
window.initialUserSettings = {};

function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function extractIconFromHtml(html) {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const img = doc.querySelector('img:first-of-type');
    return img ? img.src : '';
}

function extractPlaqueFromHtml(html) {
    if (!html) return null;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('plaque');
}

function extractPlaqueTexts(plaque) {
    if (!plaque) return ['', ''];
    const pTags = plaque.querySelectorAll('p');
    return [
        pTags[0]?.textContent || '',
        pTags[1]?.textContent || ''
    ];
}

function extractPlaqueColor(plaque) {
    if (!plaque) return '#D4623E';
    const style = plaque.getAttribute('style') || '';
    const colorMatch = style.match(/radial-gradient\([^,]+, (#[0-9A-F]{6})/i);
    return colorMatch ? colorMatch[1] : '#D4623E';
}

document.addEventListener('DOMContentLoaded', function() {
    const userBg = typeof UserFld1 !== 'undefined' ? decodeHtml(UserFld1).match(/src=['"]([^'"]+)['"]/)?.[1] : '';
    const userIcon = typeof UserFld2 !== 'undefined' ? extractIconFromHtml(decodeHtml(UserFld2)) : 
                    (typeof UserFld5 !== 'undefined' ? decodeHtml(UserFld5).match(/src=['"]([^'"]+)['"]/)?.[1] : '');
    const userPlaque = typeof UserFld2 !== 'undefined' ? extractPlaqueFromHtml(decodeHtml(UserFld2)) : null;
    
    window.userInitialColor = userPlaque ? extractPlaqueColor(userPlaque) : '#D4623E';
    window.initialUserSettings = {
        bg: userBg,
        icon: userIcon,
        plaqueHTML: userPlaque ? userPlaque.outerHTML : '',
        plaqueTexts: userPlaque ? extractPlaqueTexts(userPlaque) : ['первая строка плашки', 'вторая строка плашки']
    };
    
    saveInitialState();
    
    initAvatar();
    initUsername();
    initPersonalTitle();
    initPlaque();
    initBackgrounds();
    initIcons();
    initButtons();
    
    if (window.initialUserSettings.icon) {
        const targetIcon = document.querySelector('.fitting-icon');
        if (targetIcon) {
            targetIcon.src = window.initialUserSettings.icon;
            document.querySelectorAll('fittingicons img').forEach(icon => {
                icon.classList.remove('fit-selected');
                if (icon.src === window.initialUserSettings.icon) {
                    icon.classList.add('fit-selected');
                }
            });
        }
    }
});

function saveInitialState() {
    const plaqueElement = document.querySelector('plaque');
    const plaqueTexts = plaqueElement ? Array.from(plaqueElement.querySelectorAll('p')).map(p => p.textContent) : ['', ''];
    
    window.initialState = {
        bg: document.querySelector('.fitting-bg img')?.src || '',
        icon: document.querySelector('.fitting-icon')?.src || '',
        avatar: document.querySelector('.fitting-avatar img')?.src || '',
        username: document.querySelector('.fitting-author a')?.textContent || '',
        plaqueHTML: plaqueElement?.outerHTML || '',
        plaqueTexts: plaqueTexts
    };
}

function initAvatar() {
    const avatarContainers = document.querySelectorAll('li.fitting-avatar img');
    const initialAvatar = typeof UserAvatar !== 'undefined' ? UserAvatar : window.initialState.avatar;
    
    if (initialAvatar) {
        avatarContainers.forEach(img => {
            img.src = initialAvatar;
            img.style.cursor = 'pointer';

            img.addEventListener('click', function(e) {
                e.stopPropagation();
                openAvatarEditor(img);
            });
        });
    }
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
        font: '400 11px var(--font-main)',
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
        const initialAvatar = typeof UserAvatar !== 'undefined' ? UserAvatar : window.initialState.avatar;
        urlInput.value = initialAvatar;
        imgElement.src = initialAvatar;
        showTempMessage(defaultButton, 'установлено!');
    });

    const applyButton = createModalButton('применить', () => {
        imgElement.src = urlInput.value;
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

function initUsername() {
    const usernameElements = document.querySelectorAll('.fitting-author a');
    
    if (typeof UserLogin !== 'undefined') {
        usernameElements.forEach(element => {
            const originalHref = element.getAttribute('href') || '#';
            const originalClass = element.getAttribute('class') || '';
            
            element.textContent = UserLogin;
            element.setAttribute('href', originalHref);
            element.setAttribute('class', originalClass);
        });
    }
}

function initPersonalTitle() {
    if (typeof UserFld4 !== 'undefined' && UserFld4) {
        const decodedHTML = new DOMParser()
            .parseFromString(UserFld4, 'text/html')
            .documentElement.textContent;

        document.querySelectorAll('li.fitting-lz lz').forEach(block => {
            block.innerHTML = decodedHTML;
        });
    }
}

function initPlaque() {
    let plaqueElement = document.querySelector('.fitting-plaque plaque');
    if (!plaqueElement) return;
    window.updatePlaque = updatePlaque;

    if (window.initialUserSettings.plaqueHTML) {
        const userPlaque = new DOMParser()
            .parseFromString(window.initialUserSettings.plaqueHTML, 'text/html')
            .querySelector('plaque');

        if (userPlaque) {
            const currentInputs = Array.from(document.querySelectorAll('.plaque-input')).map(input => input.value);

            plaqueElement.innerHTML = userPlaque.innerHTML;
            const plaqueStyle = userPlaque.getAttribute('style');
            if (plaqueStyle) {
                plaqueElement.setAttribute('style', plaqueStyle);
            }

            plaqueElement = document.querySelector('.fitting-plaque plaque');

            const updatedParagraphs = plaqueElement.querySelectorAll('p');
            currentInputs.forEach((text, index) => {
                if (updatedParagraphs[index] && text !== (window.initialUserSettings.plaqueTexts[index] || window.initialState.plaqueTexts[index])) {
                    updatedParagraphs[index].textContent = text;
                }
            });
        }
    }

    const controlsContainer = document.querySelector('.plaque-controls');
    if (!controlsContainer) return;

    const colorContainer = document.createElement('div');
    colorContainer.style.display = 'flex';
    colorContainer.style.alignItems = 'center';
    colorContainer.style.margin = '10px 0';
    colorContainer.style.gap = '10px';

    const resetColorBtn = document.createElement('button');
    resetColorBtn.textContent = 'Сбросить';
    resetColorBtn.style.padding = '5px 10px';
    resetColorBtn.style.marginRight = '10px';
    resetColorBtn.style.fontFamily = 'Rubik';
    resetColorBtn.style.fontSize = '12px';
    resetColorBtn.style.cursor = 'pointer';

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = window.userInitialColor;

    const colorInput = document.createElement('input');
    colorInput.type = 'text';
    colorInput.placeholder = 'HEX-цвет (#RRGGBB)';
    colorInput.value = window.userInitialColor;
    colorInput.style.flex = '1';
    colorInput.style.padding = '5px';
    colorInput.style.maxWidth = '150px';

    colorContainer.append(resetColorBtn, colorPicker, colorInput);
    controlsContainer.appendChild(colorContainer);

    function updatePlaque() {
        const plaqueElement = document.querySelector('.fitting-plaque plaque');
        if (!plaqueElement) return;

        const inputs = document.querySelectorAll('.plaque-input');
        const paragraphs = plaqueElement.querySelectorAll('p');

        inputs.forEach((input, index) => {
            if (paragraphs[index]) {
                paragraphs[index].textContent = input.value;
            }
        });

        let color = colorPicker.value;
        if (/^#[0-9A-F]{6}$/i.test(colorInput.value)) {
            color = colorInput.value;
            colorPicker.value = color;
        }

        plaqueElement.style.background = `radial-gradient(98.64% 362.92% at 56% -21%, ${color} 0%, #FFF0EB 80%)`;
    }

    document.querySelectorAll('.plaque-input').forEach(input => {
        input.addEventListener('input', () => {
            window.__changed.plaqueText = true;
            updatePlaque();
        });
    });

    colorPicker.addEventListener('input', function () {
        colorInput.value = this.value;
        window.__changed.plaqueColor = true;
        updatePlaque();
    });

    colorInput.addEventListener('input', function () {
        if (/^#[0-9A-F]{6}$/i.test(this.value)) {
            colorPicker.value = this.value;
            window.__changed.plaqueColor = true;
            updatePlaque();
        }
    });

    resetColorBtn.addEventListener('click', function () {
        colorPicker.value = window.userInitialColor;
        colorInput.value = window.userInitialColor;
        window.__changed.plaqueColor = true;
        updatePlaque();
        showNotification('Цвет сброшен к исходному');
    });

    const initialTexts = window.initialUserSettings.plaqueTexts || [];
    document.querySelectorAll('.plaque-input').forEach((input, index) => {
        input.value = initialTexts[index] || '';
    });

    updatePlaque(); 
}

function initBackgrounds() {
    const bgContainer = document.querySelector('fittingbg');
    const targetBg = document.querySelector('.fitting-bg img');
    
    if (bgContainer && targetBg) {
        if (window.initialUserSettings.bg) {
            targetBg.src = window.initialUserSettings.bg;
        }

        bgContainer.querySelectorAll('img').forEach(bgImg => {
            bgImg.style.cursor = 'pointer';
            
            if (bgImg.src === targetBg.src) {
                bgImg.classList.add('fit-selected');
            }

            bgImg.addEventListener('click', function() {
                bgContainer.querySelectorAll('img').forEach(img => {
                    img.classList.remove('fit-selected');
                });
                
                this.classList.add('fit-selected');
                targetBg.src = this.src;
                window.__changed.bg = true;
            });
        });
    }
}

function initIcons() {
    const fittingIconsContainer = document.querySelector('fittingicons');
    const targetIcon = document.querySelector('.fitting-icon');
    
    if (fittingIconsContainer && targetIcon) {
        if (window.initialUserSettings.icon) {
            targetIcon.src = window.initialUserSettings.icon;
        }

        fittingIconsContainer.querySelectorAll('img').forEach(icon => {
            icon.style.cursor = 'pointer';

            if (icon.src === targetIcon.src) {
                icon.classList.add('fit-selected');
            }

            icon.addEventListener('click', function() {
                fittingIconsContainer.querySelectorAll('img').forEach(i => {
                    i.classList.remove('fit-selected');
                });

                this.classList.add('fit-selected');
                targetIcon.src = this.src;
                window.__changed.icon = true;
            });
        });
    }
}

function initButtons() {
    const copyButton = document.querySelector('.fit-copy');
    if (copyButton) {
        copyButton.addEventListener('click', copyChanges);
    }

    const resetButton = document.querySelector('.fit-cleardata');
    if (resetButton) {
        resetButton.addEventListener('click', resetToInitial);
    }
}

// копирование 

function copyChanges() {
    let fullCode = '';

    const currentBg = document.querySelector('.fitting-bg img')?.src || '';
    const currentIcon = document.querySelector('.fitting-icon')?.src || '';
    const plaque = document.querySelector('plaque');

    const currentTextInputs = Array.from(document.querySelectorAll('.plaque-input')).map(input => input.value.trim());

    const colorInput = document.querySelector('.plaque-controls input[type="text"][placeholder^="HEX"]');
    const colorPicker = document.querySelector('.plaque-controls input[type="color"]');

    let currentColor = colorInput?.value || colorPicker?.value || '#d4623e';

    if (!/^#[0-9a-f]{6}$/i.test(currentColor)) {
        currentColor = '#d4623e'; 
    }

    const plaqueHTML = plaque
        ? `<plaque style="background: radial-gradient(98.64% 362.92% at 56% -21%, ${currentColor} 0%, #FFF0EB 80%)"><p>${currentTextInputs[0] || ''}</p><p>${currentTextInputs[1] || ''}</p></plaque>`
        : '';

    const bgChanged = currentBg !== (window.initialUserSettings.bg || window.initialState.bg);
    const iconChanged = currentIcon !== (window.initialUserSettings.icon || window.initialState.icon);

    const initialTexts = window.initialUserSettings.plaqueTexts || window.initialState.plaqueTexts || ['', ''];
    const initialColor = (() => {
        const rawHTML = window.initialUserSettings.plaqueHTML || window.initialState.plaqueHTML || '';
        const temp = document.createElement('div');
        temp.innerHTML = rawHTML;
        const style = temp.querySelector('plaque')?.getAttribute('style') || '';
        const match = style.match(/radial-gradient\([^,]+, (#[0-9A-Fa-f]{6})/i);
        return match ? match[1].toLowerCase() : '#d4623e';
    })();

    const textChanged = currentTextInputs[0] !== initialTexts[0] || currentTextInputs[1] !== initialTexts[1];
    const colorChanged = currentColor.toLowerCase() !== initialColor;
    const plaqueChanged = textChanged || colorChanged;

    if (bgChanged) {
        fullCode += `бэкграунд профиля - 250\n[code]<img src="${currentBg}">[/code]\n\n`;
    }

    if (iconChanged) {
        fullCode += `иконка - 150 \n[code]<img src="${currentIcon}" class="fitting-icon">[/code]\n\n`;
    }

    if (plaqueChanged && plaqueHTML) {
        fullCode += `плашка - 200\n[code]${plaqueHTML}[/code]`;
    }

    if (fullCode.trim()) {
        fullCode += `\n\n[b]итого:[/b]\nсумма в профиле - сумма покупок = оставшаяся на счету сумма`;
        copyToClipboard(fullCode);
    } else {
        showNotification('Никаких изменений для копирования не найдено!');
    }
    
}


// сброс до базовых настроек профиля

function resetToInitial() {
    const bgImg = document.querySelector('.fitting-bg img');
    if (bgImg) {
        bgImg.src = window.initialUserSettings.bg || window.initialState.bg;
        window.__changed.bg = false;
    }

    const iconImg = document.querySelector('.fitting-icon');
    if (iconImg) {
        iconImg.src = window.initialUserSettings.icon || window.initialState.icon;
        window.__changed.icon = false;

        document.querySelectorAll('fittingicons img').forEach(img => {
            img.classList.remove('fit-selected');
            if (img.src === (window.initialUserSettings.icon || window.initialState.icon)) {
                img.classList.add('fit-selected');
            }
        });
    }

    const avatarImg = document.querySelector('.fitting-avatar img');
    if (avatarImg) {
        avatarImg.src = typeof UserAvatar !== 'undefined' ? UserAvatar : window.initialState.avatar;
        window.__changed.avatar = false;
    }

    const usernameElements = document.querySelectorAll('.fitting-author a');
    usernameElements.forEach(element => {
        element.textContent = typeof UserLogin !== 'undefined' ? UserLogin : window.initialState.username;
    });

    const plaque = document.querySelector('plaque');
    if (plaque) {
        const initialPlaque = window.initialUserSettings.plaqueHTML
            ? new DOMParser().parseFromString(window.initialUserSettings.plaqueHTML, 'text/html').querySelector('plaque')
            : null;

        if (initialPlaque) {
            plaque.innerHTML = initialPlaque.innerHTML;
            plaque.setAttribute('style', initialPlaque.getAttribute('style') || '');
        } else {
            const texts = window.initialUserSettings.plaqueTexts || window.initialState.plaqueTexts;
            const pTags = plaque.querySelectorAll('p');
            texts.forEach((text, index) => {
                if (pTags[index]) pTags[index].textContent = text;
            });
            plaque.style.background = `radial-gradient(98.64% 362.92% at 56% -21%, ${window.userInitialColor} 0%, #FFF0EB 80%)`;
        }

        window.__changed.plaqueText = false;
        window.__changed.plaqueColor = false;
    }

    const textInputs = document.querySelectorAll('.plaque-input');
    if (textInputs) {
        const texts = window.initialUserSettings.plaqueTexts || window.initialState.plaqueTexts;
        texts.forEach((text, idx) => {
            if (textInputs[idx]) textInputs[idx].value = text;
        });
    }

    if (typeof window.updatePlaque === 'function') {
        window.updatePlaque();
    }

    const colorInput = document.querySelector('.plaque-controls input[type="text"][placeholder^="HEX"]');
    const colorPicker = document.querySelector('.plaque-controls input[type="color"]');

    if (colorInput && colorPicker) {
        const initialColor = window.initialUserSettings.plaqueHTML
            ? extractPlaqueColor(new DOMParser().parseFromString(window.initialUserSettings.plaqueHTML, 'text/html').querySelector('plaque'))
            : window.userInitialColor;

        colorInput.value = initialColor;
        colorPicker.value = initialColor;
    }

    showNotification('Все значения сброшены к изначальным');
}


function createModalButton(text, onClick, bgColor = '#e0e0e0', textColor = 'black') {
    const button = document.createElement('button');
    button.textContent = text;
    Object.assign(button.style, {
        padding: '5px 10px',
        cursor: 'pointer',
        border: 'none',
        font: '400 11px var(--font-main)',
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '5px'
    });
    button.addEventListener('click', function(e) {
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

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('скопировано!');
    }).catch(err => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('скопировано!');
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px 20px',
        fontFamily: 'Rubik', 
        fontSize: '12px',
        borderRadius: '5px',
        zIndex: '10000',
        transition: 'opacity 0.3s',
        opacity: '1'
    });
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}
