# Aplicativo Android/IOS para Rádio Web

O [Vagalume](http://www.vagalume.com.br/) disponibilizou gratuitamente o código fonte para você criar um aplicativo para Android e IOS para sua rádio. O código pode ser compilado e disponibilizado para dispositivos Android (Google Play) e IOS (App Store).

## Contratação de Desenvolvedores

O Vagalume indica abaixo alguns desenvolvedores freelancers que podem ser contratados pela rádio para fazer a customização do aplicativo. A contratação não tem nenhum vínculo com o Vagalume, é apenas uma indicação de desenvolvedores.

**Leonardo Flores** - [GitHub](https://github.com/leonardocouy) / [Facebook](https://www.facebook.com/leonardo.claw) / [Email](mailto:leonardocouy@hotmail.com) / [Twitter](https://twitter.com/_iamleofc)

A equipe do Vagalume poderá ajudar quando for necessário. [Entre em contato](https://github.com/vagalume/aplicativo-para-radios/issues) pelo GitHub.

## Adicionando uma plataforma

```bash
#Android
ionic platform add android

#IOS
ionic platform add ios
```

## Customização do projeto

Existe algumas configurações que você precisa fazer para deixar seu aplicativo completamente dedicado para sua Rádio.

ID da Rádio

* Você precisa colocar o seu ID da Rádio no arquivo `www/manifest.json`.

Tela de splash
* Segue um <a href="http://ionicframework.com/docs/cli/icon-splashscreen.html">link</a> para trocar o splash 

Todas as informações adicionais (stream, logo da rádio e últimas músicas tocadas) são baixadas da API do Vagalume. É necessário a rádio estar cadastrada no [Vagalume Rádios](http://www.vagalume.com.br/radio/).

Documentação das requisições de Rádios se encontra na nossa [API](http://api.vagalume.com.br/docs/radios/).

## Configuração do aplicativo

Você pode configurar o nome, versão, pacote e outras informaçãos do seu aplicativo no arquivo `config.xml`.

Nome do aplicativo: `<name>Nome do seu aplicativo</name>`

Versão do aplicativo(version) e o pacote(id): `<widget id="fm.vagalume" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">`

## Testando seu aplicativo

Segue um link do IONIC para você conseguir fazer todos os testes e emular no seu dispositivo o seu aplicativo.

http://ionicframework.com/docs/guide/testing.html

## Publicando seu aplicativo

Logo depois de você fazer todas modificações e testar seu aplicativo, você pode publicar seu aplicativo gerando o APK para poder subir na Google Play ou Apple Store.

Segue um link do IONIc com exemplos para poder gerar o APK.

http://ionicframework.com/docs/guide/publishing.html


