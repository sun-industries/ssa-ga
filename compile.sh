#emcc -lembind -s MODULARIZE=1 -s ENVIRONMENT='web' ../saga/src/lib/c++/adapter.cpp -o ../saga/src/lib/c++/SGP4.mjs -sEXPORTED_RUNTIME_METHODS=cwrap -sEXPORTED_FUNCTIONS=_twoline2satrec,_increment

#./emsdk install latest
#./emsdk activate latest

# We assume that emsdk was installed in the parent of the root directory of the project.
../emsdk/emsdk activate latest
source ../emsdk/emsdk_env.sh

emcc -lembind -s MODULARIZE=1 -s ENVIRONMENT='worker' src/lib/c++/adapter.cpp -o src/lib/c++/cpp.mjs -s ALLOW_MEMORY_GROWTH -s MAXIMUM_MEMORY=1GB -O3
#emcc -lembind -s MODULARIZE=1 -s ENVIRONMENT='worker' src/lib/c++/adapter.cpp -o src/lib/c++/cpp.mjs -s ALLOW_MEMORY_GROWTH -s MAXIMUM_MEMORY=1GB -sASSERTIONS -O3 -sNO_DISABLE_EXCEPTION_CATCHING
#emcc -lembind -s ENVIRONMENT='worker' src/lib/c++/adapter.cpp -o src/lib/c++/cpp.mjs -s ALLOW_MEMORY_GROWTH -s MAXIMUM_MEMORY=1GB -sASSERTIONS

# hack to solve a bug
sed -i 's/import.meta.url/self.location.href/g' src/lib/c++/cpp.mjs

cp src/lib/c++/cpp.wasm public/assets/cpp.wasm # works in prod
cp src/lib/c++/cpp.wasm src/lib/cpp.wasm       # works in dev

echo "Finished"
