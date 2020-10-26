# nodejs-Molecule-express
Una simple prueba de microservicios, base de datos relacional y Express.

## Antes de empezar
Todos los comando mencionados en este README asumen que el proyecto ya fue clonado y que además se tiene abierto un terminal o consola de comandos dentro de la respectiva carpeta donde se clonó este repositorio.

## ¿Cómo ejecutarlo?
Para iniciar es importante primero crear un archivo `.env` o en su defecto tener las siguientes variables de entorno cargadas en el sistema:
```shell
DB_USER= //El usuario de Mysql
DB_PASS= //La contraseña de dicho usuario
DB_HOST= //La url o ip para la conexión
DB_SCHEMA= //El nombre de la db a la que se debe conectar 
PORT= //El puerto en el que se espera que corra el API rest, por defecto es 8000
JWT_SECRET= //El secreto para JWT
```
Con estas variables el programa puede correr y empezar a escuchar peticiones en el API. Sino se ha creado la base de datos específica, entonces se puede crear mediante el archivo `estructura.sql` que se encuentra en este repositorio. Es importante que se utilice este archivo en una base de datos **MySQL**.

Una vez realizado esto se puede proceder a importar los modulos necesarios con el commando `npm install`. Al hacer esto se van a descargar los modules de node en el sistema y una vez que esto termine se puede proceder a correr este proyecto utilizando el comando `npm run start`.

## ¿Cómo ejecutar los test?
Por alguna razón npm tiene problemas ejecutando jest. Por lo que **se deben correr los test de forma manual**. Para esto simplemente se debe ejecutar el comando `npx jest` y esperar a que se ejecuten las pruebas.

## ¿Cómo pruebo el REST?
Para probar el rest se puede utilizar programas como postman para ejecutar los servicios que están allí. Dentro de este repositorio se encuentra un archivo de nombre `Microservices API.postman_collection.json` el cual puede ser importado a postman y tiene ejemplos de como utilizar cada *endpoint* del API REST. Es importante que al momento de hacer login **se actualice el token JWT**, para hacer esto solo es necesario copiar el token en postman, ir a la carpeta donde se encuentra guardados los endpoints en postman, editar la carpeta y en la sección de variables poner la variable `token` con el valor copiado al momento de hacer log in.
