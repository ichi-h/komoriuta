function gen-index-ts() {
  # 現在のディレクトリを取得
  current_dir=$(pwd)

  # 引数で取得したディレクトリへ移動
  dir=$1
  cd $dir

  files=( $(ls -p | grep -v /) )

  # index.tsを初期化
  echo "" > index.ts

  # 各ファイルに対して
  for file in "${files[@]}"
  do
    if [ $file = "index.ts" ]; then
      continue
    fi
    # ファイル名から拡張子を除去
    filename=$(basename "$file" .ts)
    
    # *_connect.ts と *_pb.ts を区別して処理
    if [[ $filename == *_connect ]]; then
      # _connect ファイルは名前空間付きでエクスポート
      module_name=$(echo "$filename" | sed 's/_connect$//')
      # キャメルケースに変換（例: access_token -> AccessToken）
      service_name=$(echo "$module_name" | awk -F_ '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) tolower(substr($i,2))}}1' OFS="")
      echo "export * as ${service_name}Connect from './$filename';" >> index.ts
    elif [[ $filename == *_pb ]]; then
      # _pb ファイルは名前空間付きでエクスポート
      module_name=$(echo "$filename" | sed 's/_pb$//')
      # キャメルケースに変換（例: access_token -> AccessToken）
      service_name=$(echo "$module_name" | awk -F_ '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) tolower(substr($i,2))}}1' OFS="")
      echo "export * as ${service_name}Pb from './$filename';" >> index.ts
    else
      # その他のファイルは通常通りエクスポート
      echo "export * from './$filename';" >> index.ts
    fi
  done

  cd $current_dir
}

buf generate --path ./komoriuta
gen-index-ts "../bun/packages/connect/komoriuta/v1"
