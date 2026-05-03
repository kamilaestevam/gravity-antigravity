@echo off
:: Inicia o backend do configurador (porta 8005)
:: Usa node para pre-carregar o .env ANTES do tsx iniciar os imports ESM.
:: Sem isso, CLERK_SECRET_KEY e ORGANIZACAO_DATABASE_URL chegam undefined porque
:: imports estaticos ESM rodam ANTES de qualquer dotenv.config() no corpo
:: do modulo — clerk.ts dispara throw imediatamente se a chave nao existir.

cd /d C:\Users\danie\gravity-antigravity\servicos-global\configurador

node -e "require('dotenv').config({path:'.env'}); require('dotenv').config({path:'../../.env.local'}); const {spawn}=require('child_process'); spawn('npx',['tsx','server/index.ts'],{env:process.env,stdio:'inherit',shell:true});"
