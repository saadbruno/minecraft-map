import { EmojiButton } from '../vendor/emojibutton/emoji-button.min.js';

const trigger = document.querySelector('#icon-selector');
var iconList;

$.getJSON('/api/icons?format=emoji-button', function (data, status) {

    iconList = data;

    const picker = new EmojiButton({
        categories: [],
        showRecents: false,
        showCategoryButtons: false,
        initialCategory: 'custom',
        // emojiSize: '20px',
        custom: iconList,
        styleProperties: {
            '--emoji-preview-size': '4em'
        }
    });

    picker.on('emoji', selection => {

        // replaces the icon in the UI
        replaceIcon(trigger, selection.url);
        // sets hidden input to icon id
        $('#submit-form').find('input[name="icon"]').val(selection.customData.id);

    });

    trigger.addEventListener('click', () => picker.togglePicker(trigger));

});

