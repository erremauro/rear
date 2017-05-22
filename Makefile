export NODE_ENV = test

test: test-clean
	lerna run test

clean: test-clean
	rm -rf coverage
	rm -rf packages/*/npm-debug*
	rm -rf yarn-error*
	rm -rf lerna-debug*

test-clean:
	rm -rf packages/*/__tests__/tmp

clean-all:
	rm -rf node_modules
	rm -rf packages/*/node_modules
	make clean

bootstrap: clean-all
	yarn
	./node_modules/.bin/lerna bootstrap
