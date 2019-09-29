"use strict";

const { ipcRenderer } = require("electron");
window.jQuery = window.$ = require('jquery');
const GoldenLayout = require("golden-layout");

$(function () {
    console.log('start');

    var config = {
        content: [{
            type: 'column',
            content: [
                {
                    type: 'row',
                    content: [
                        {
                            type: 'component',
                            componentName: 'pages',
                            componentState: { label: 'Pages' },
                            width: 50,
                            height: 10,
                        },
                        {
                            type: 'component',
                            componentName: 'files',
                            componentState: { label: 'Files' },
                            width: 50,
                            height: 10
                        },
        
                    ]
                },
                {
                    type: 'component',
                    componentName: 'pageImages',
                    componentState: { label: 'Page Images' },
                    height: 80,
                    width: 100,
                    isClosable: false
                }
            ]
        }]
    };
    var myLayout = new GoldenLayout(config);

    myLayout.registerComponent('pages', function (container, componentState) {
        container.getElement().html(componentState.label);
    });
    myLayout.registerComponent('files', function (container, componentState) {
        container.getElement().html(componentState.label);
    });
    myLayout.registerComponent('pageImages', function (container, componentState) {
        container.getElement().html('<div id="contents"></div>');
    });

    myLayout.init();

    ipcRenderer.on('html', (event, html) => {
        console.log('rx html');
        $("#contents").html(html);
    });

    ipcRenderer.send('reloaded');
});

