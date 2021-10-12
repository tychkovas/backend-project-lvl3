install: install-deps

install-deps:
	npm ci

test:
	npm test

test_debug:
	npm run test_debug
	
test-coverage:
	npm test -- --coverage

#for window
PATH_OUTPUT := .\var\tmp

#for linux
#PATH_OUTPUT = /var/tmp

clean:
	rm -Rf var/tmp/*

run_win:
	@echo "Start load page test. The folder $(PATH_OUTPUT) must exists."
	node bin/page-loader.js --output $(PATH_OUTPUT) https://ru.hexlet.io/courses

run_win_ls:
	@echo "Start load page test. The folder $(PATH_OUTPUT) must exists."
	ls -a $(PATH_OUTPUT)
	node bin/page-loader.js --output $(PATH_OUTPUT) https://ru.hexlet.io/courses
	ls -a $(PATH_OUTPUT)

run_linux:
	@echo "Start load page test"
	node bin/page-loader.js --output /var/tmp https://ru.hexlet.io/courses

lint:
	npx eslint .

publish:
	npm publish --dry-run

.PHONY: test