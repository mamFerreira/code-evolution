import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-level-play',
  templateUrl: './level-play.component.html',
  styleUrls: ['./level-play.component.css']
})
export class LevelPlayComponent implements OnInit {

  @ViewChild('editor') editor;
  public text: string;

  constructor() {
    this.text = '';
  }

  ngOnInit() {
    this.initEditor();
  }

  initEditor() {
    this.editor.setTheme('eclipse');
    this.editor.setMode('python');

    this.editor.getEditor().setOptions({
        enableBasicAutocompletion: true,
        fontSize: '14px'
    });

    /*this.editor.getEditor().commands.addCommand({
        name: 'showOtherCompletions',
        bindKey: 'Ctrl-.',
        exec: function (editor) {

        }
    });*/
  }

}
