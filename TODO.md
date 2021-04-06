１週間で宇宙を作ることができるかチャレンジ

movementはカクカクした離散的な動きがいい？
じゃあcharacterはなし？うーん...

- movement
  - (..........) 今までの入力をリピートする
  - (completed!) deltaを使って、処理か重かったら何かして誤魔化す
  - (complete..) movement hardware
  - (completed.) movement program

- xml_to_json
  - (completed!) parse texts mostly
  - (..........) 時間が余ったら parse figure
  - (..........) 時間が余ったら parse elements listed in nonempty_set_child.txt

- character
  - "顔文字"が文章の一部をDNAのような感じで複写して、その複写したもの(RNA)をベースに"顔文字"(タンパク質)が作られる。文章の列がランダムシードとなって"顔文字"のパラメータを決定する。
  - 複写されてできた2つ〜3つの断片が融合する？コドンみたいに隣接する3つの文字がひとまとまりになる？？

- coordinator
  - (..........) 十字架 + 頭の顔文字
  - (completed!) building layout generation
  - (..........) emoji generation
  - (..........) building <-> emoji interaction
  - (..........) character <-> emoji interaction
  - (..........) character <-> building interaction

- building
  - (..........) fix prepareLinkPlots (fix starting positions)
  - (..........) すべてをdynamicにする。W = width * cos + height * sin, H = width * sin + height * cos
  - (..........) 括弧グラフィック・処理
  - (completed!) textがひょうじされないバグ修正（表示物を減らせば直る？？local密度を測って抑制フィードバック？？）
  - (completed!) draw text
  - (completed!) construct point plot data
  - (completed!) construct link plot data
  - (completed!) draw point plots (e.g. #s1# #p#)
  - (completed!) draw link plots (links between words which have been used more than once)
  - (..........) 時間が余ったら 組版処理(change)

- park
  - (..........) 象徴之璽
  - (comple....) ＧＯＤ璽
  - (..........) 時間が余ったら 隠しtips

- emoji
  - (completed!) latex emoji generation
  - (..........) latex emoji auto-generation
  - (..........) shader