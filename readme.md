# Firenyx

Firenyx je roz���en� do Mozilla Firefox, kter� umo��uje odes�lat a upozor�ovat 
na novou postu na komunitnim serveru www.nyx.cz, ukazovat p�ihl�en� p��tel� a i
strom nep�e�ten�ch klub�.

## Jak vyv�jet ve Firefoxu

V adres��i extensions ve va�em profilu Firefoxu, nap�.:

	cd "c:\Users\user\AppData\Roaming\Mozilla\Firefox\Profiles\u905xshw.default-1360700277389\extensions\

prove�te checkout Gitem do adres��e `{5591137f-ca2c-4c2a-93d1-5514992b2d4a}` (guid
roz���en� mus� odpov�dat tomu, co je install.rdf):

	git clone https://github.com/arcao/Firenyx.git "{5591137f-ca2c-4c2a-93d1-5514992b2d4a}"

po restartu Firefoxu ji� roz���en� Firenyx funguje.

## Sestaven� XPI instala�n�ho bal��ku

Pro sestaven� instala�n�ho bal��ku je pou�it Gradle build syst�m. Sestaven� 
provedete p�es p��kaz:

	gradlew assemble
	
v�sledn� xpi soubor se pak nach�z� v adres��i `build\distributions`. Jm�no XPI
souboru obsahuje verzi, kter� je z�sk�na ze souboru `install.rdf`.

#### Pozn�mka

Pokud se chcete odklonit od v�vojov� verze a tvo�it vlastn� produkt, nezapome�te
do install.rdf vygenerovat vlastn� guid, a� se to netloukne. 


  