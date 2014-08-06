# transparência.js

> Um wrapper javascript sobre a [API](http://dev.transparencia.org.br/) do [transparencia.gov.br](http://transparencia.org.br/)

**HEAVY DEV**

## Install

```sh
$ npm install --save transparencia
```

ou

```sh
$ bower install --save transparencia
```

## Usage


### Códigos de erro

| Code |          Text         |                                       Description                                        |
|------|-----------------------|------------------------------------------------------------------------------------------|
|      |                       |                                                                                          |
|  200 | OK                    | Sucesso!                                                                                 |
|  400 | Bad Request           | A requisição possui parametro(s) inválido(s)                                             |
|  401 | Unauthorized          | O token de acesso não foi informado ou não possui acesso as APIs.                        |
|  404 | Not Found             | O recurso informado no request não foi encontrado.                                       |
|  413 | Request is to Large   | A requisição está ultrapassando o limite permitido para o perfil do seu token de acesso. |
|  422 | Unprocessable Entity  | A requisição possui erros de negócio.                                                    |
|  429 | Too Many Requests     | O consumidor estourou o limite de requisições por tempo.                                 |
|  500 | Internal Server Error | Erro não esperado, algo está quebrado na API.                                            |


## Browser Compatibility

Using [testling-ci](https://ci.testling.com/) is a must. It is certainly in the road map :neckbeard:
