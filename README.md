# Aplicativo Android/IOS para Rádio Web

O [Vagalume](http://www.vagalume.com.br/) disponibilizou gratuitamente o código fonte para você criar um aplicativo para Android e IOS para sua rádio. O código pode ser compilado e disponibilizado para dispositivos Android (Google Play) e IOS (App Store).

## Contratação de Desenvolvedores

O Vagalume indica abaixo alguns desenvolvedores freelancers que podem ser contratados pela rádio para fazer a customização do aplicativo. A contratação não tem nenhum vínculo com o Vagalume, é apenas uma indicação de desenvolvedores (em ordem alfabética).

* [Caio Norder](https://github.com/caionorder)
* [Cleiton Tavares](https://github.com/cleiton-tavares)
* [Leonardo Flores](https://github.com/leonardocouy)
* [Pedro Brasileiro](https://github.com/pedrobrasileiro)

Desenvolvedores: _Envie um Pull Request adicionando seu nome como desenvolvedor Ionic e colabore com o projeto!_

A equipe do Vagalume sempre poderá ajudar quando for necessário. [Entre em contato](https://github.com/vagalume/aplicativo-para-radios/issues) pelo GitHub.

## Adicionando uma plataforma

```bash
# Android
ionic platform add android

# IOS
ionic platform add ios
```

## Customização do projeto

Existe algumas configurações que você precisa fazer para deixar seu aplicativo completamente dedicado para sua Rádio.

*ID da Rádio*
* Coloque o ID da Rádio no arquivo `www/manifest.json`.
* O ID da rádio está disponível no seu [cadastro no Vagalume](https://auth.vagalume.com.br/settings/radio/).

*Tela de splash*
* Adicione as imagens seguindo a [documentação do Ionic](http://ionicframework.com/docs/cli/icon-splashscreen.html).

Todas as informações adicionais (stream, logo da rádio e últimas músicas tocadas) são baixadas da API do Vagalume. É necessário a rádio estar cadastrada no [Vagalume Rádios](http://www.vagalume.com.br/radio/).

Documentação das requisições de Rádios se encontra na nossa [API](http://api.vagalume.com.br/docs/radios/).

## Configuração do aplicativo

Você pode configurar o nome, versão, pacote e outras informaçãos do seu aplicativo no arquivo `config.xml`.

Nome do aplicativo: `<name>Nome do seu aplicativo</name>`

Versão do aplicativo(version) e o pacote(id): `<widget id="fm.vagalume" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">`

## Testando seu aplicativo

Segue um link do Ionic para você conseguir fazer todos os testes e emular no seu dispositivo o seu aplicativo.

http://ionicframework.com/docs/guide/testing.html

## Publicando seu aplicativo

Logo depois de você fazer todas modificações e testar seu aplicativo, você pode publicar seu aplicativo gerando o APK para poder subir na Google Play ou Apple Store.

Segue um link do IONIc com exemplos para poder gerar o APK.

http://ionicframework.com/docs/guide/publishing.html
