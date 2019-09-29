const path = require('path');

var app = {
    mode: 'development',
    target: 'electron-main',
    entry: path.join(__dirname, 'src', 'main','app'),
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist','main')
    },
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [{
            test: /.ts?$/,
            include: [
                path.resolve(__dirname, 'src'),
            ],
            exclude: [
                path.resolve(__dirname, 'node_modules')
            ],
            loader: 'ts-loader',
        }]
    },
    resolve: {
        extensions: ['.js', '.ts']
    }
};

var main_win = {
    mode: 'development',
    target: 'electron-renderer',
    entry: path.join(__dirname, 'src', 'renderer', 'mainWin'),
    output: {
        filename: 'mainWin.js',
        path: path.resolve(__dirname, 'dist', 'renderer')
    },
    resolve: {
        extensions: ['.json', '.js', '.jsx', '.css', '.ts', '.tsx']
    },
    module: {
        rules: [{
            test: /\.(tsx|ts)$/,
            use: [
                'ts-loader'
            ],
            include: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'src', 'renderer'),
                path.resolve(__dirname, 'node_modules')
            ]
        },{
            test: /\.css$/,
            loaders: ["style-loader", "css-loader?modules"]
        },{
            test: /\.(jpg|png)$/,
            loaders: ['url-loader']
        }]
    },
    devtool: 'inline-source-map'
}

var pdf = {
    mode: 'development',
    target: 'electron-renderer',
    entry: path.join(__dirname, 'src', 'renderer', 'pdf'),
    output: {
        filename: 'pdf.js',
        path: path.resolve(__dirname, 'dist', 'renderer')
    },
    resolve: {
        extensions: ['.json', '.js', '.jsx', '.css', '.ts', '.tsx']
    },
    module: {
        rules: [{
            test: /\.(tsx|ts)$/,
            use: [
                'ts-loader'
            ],
            include: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'src', 'renderer'),
                path.resolve(__dirname, 'node_modules')
            ]
        }]
    },
    devtool: 'inline-source-map'
}

module.exports = [
    app, main_win, pdf
];