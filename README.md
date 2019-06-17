# src_print
convert source file(text file) to PDF-file for print

テキストファイルを PDFに変換するプログラムです。
electronで書かれています。

まだ、開発途中ですが、公開します。


## インストール方法

展開したディレクトリで、以下のコマンドを
実行すると、実行ファイル srcPrint.exe が srcPrint-win32-x64フォルダーに
作成されるはずです。

    $ npm install
    $ npm run package

このsrcPrint.exeを「スタートにピンどめ」したり、
ショートカットをデスクトップに貼り付けたり、
SendToのフォルダー( C:\Users\xxx\AppData\Roaming\Microsoft\Windows\SendTo)に
貼り付けたりすると、起動しやすくなります。


## 使用方法

pdfに変換したいファイルの指定方法は、いくつかあります。

+ プログラム起動時に引数で指定
+ srcPrintあるいはショートカットのアイコンにテキストファイルをドロップ
+ SendToフォルダーにショートカットがあれば、テキストファイルをsrcPrintに送る
+ 起動後、メニューバーの　File -> Open Fileで指定
+ 起動後、srcPrintのウィンドウにテキストファイルをドロップ

srcPrintのウィンドウに表示されるイメージを確認し、
問題がなければ、メニューから File -> Export PDFで
pdfファイルとして保存されます。

## 今後拡張したい機能

+ フォーマットの切り替え
* 印刷するファイルの順序等の編集

## リリース記録

### v1.0.0  : 2019/06/17(Mon)
 
 * ファーストリリース







