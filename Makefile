# Makefile page-loader

install:
	npm install

publish:
	npm publish --dry-run

start:
	@echo "Start load page"
	node bin/page-loader.js

#for window
PATH_OUTPUT := .\var\tmp

#for linux
#PATH_OUTPUT = /var/tmp

test:
	@echo "Start load page test"
	node src/bin/page-loader.js --output /var/tmp https://ru.hexlet.io/courses

test_win:
	@echo "Start load page test"
	node src/bin/page-loader.js --output $(PATH_OUTPUT) https://ru.hexlet.io/courses

test_win_rm:
	@echo "Start load page test"
	ls -a $(PATH_OUTPUT)
	node src/bin/page-loader.js --output $(PATH_OUTPUT) https://ru.hexlet.io/courses
	ls -a $(PATH_OUTPUT)

test2:
	@echo "Start load page test2"
	node src/bin/page-loader.js https://ru.hexlet.io/courses --output /var/tmp22

test_short:
	@echo "Start load page test_short"
	node src/bin/page-loader.js https://ru.hexlet.io/courses

tmp:
	@echo "Start load page tmp"

#Install a project with a clean slate
install_ci:
	npm ci

lint:
	npx eslint .