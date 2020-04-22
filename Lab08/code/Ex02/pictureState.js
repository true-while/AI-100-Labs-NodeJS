class PictureState {
    constructor() {
        this.greeted = 'not greeted';
        this.search = [];
        this.searching = 'no';
        this.messageCount = 0;
        this.utterance = [];
    }
}
exports.PictureState = PictureState;

class DialogState {
    constructor(name) {
        this.CurrentDialogNam = name;
    }
}
exports.DialogState = DialogState;
