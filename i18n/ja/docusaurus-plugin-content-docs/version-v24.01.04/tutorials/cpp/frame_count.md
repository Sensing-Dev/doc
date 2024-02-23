---
sidebar_position: 6
---

# フレーム数の取得

このチュートリアルでは、ion-kitを使用してカメラからフレーム数を取得する方法について学びます。

## 前提条件

* OpenCV（sensing-dev SDKと一緒に`-InstallOpenCV`オプションでインストール）
* ion-kit（sensing-dev SDKと一緒にインストール）

## チュートリアル

パイプラインの設定プロセスは、前のチュートリアルとまったく同じです。ただし、フレーム数をBBから取得するために追加の出力ポートとバッファを設定する必要があります。

### フレーム数の取得

画像を表示している間に、フレーム数情報も取得したいと思います。前のチュートリアルとの唯一の違いは、フレーム数の値を新しいポートにバインドする必要があることです。

```c++
std::vector<Halide::Buffer<uint32_t>> frame_counts;
for (int i = 0; i < num_device; ++i){
    frame_counts.push_back(Halide::Buffer<uint32_t>(1));
}
n["frame_count"].bind(frame_counts);
```

### パイプラインの実行

`builder.run()`を実行してパイプラインを完了します。

フレーム数のディレクトリは、numpy配列`frame_counts[i]`に対してi番目のデバイスの場合、各フレームカウントを次のように出力できます。

```c++
std::cout << frame_counts[0](0) << std::endl;
```

## 完全なコード

import {tutorial_version} from "@site/static/version_const/v240104.js"
import GenerateTutorialLink from '@site/static/tutorial_link.js';

<GenerateTutorialLink language="cpp" tag={tutorial_version} tutorialfile="tutorial3_getting_frame_count" />

:::caution 動かない時は
* もしお使いのOpenCVがSensing-Devインストール時に`-InstallOpenCV`オプションをつけてインストールしたものでない場合、プログラムに正しくリンクされているかを確認してください。
:::