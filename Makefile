# Makefile page-loader

install:
	npm install

publish:
	npm publish --dry-run

start:
	@echo "Start load page"
	node bin/page-loader.js

tmp:
	@echo "Start load page"

#Install a project with a clean slate
install_ci:
	npm ci

lint:
	npx eslint .