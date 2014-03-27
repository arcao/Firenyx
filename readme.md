# Firenyx

Firenyx je rozšíření do Mozilla Firefox, které umožňuje odesílat a upozorňovat 
na novou poštu na komunitnim serveru www.nyx.cz, ukazovat přihlášené přátelé a i
strom nepřečtených klubů.

## Jak vyvíjet ve Firefoxu

V adresáři extensions ve vašem profilu Firefoxu, např.:

	cd "c:\Users\user\AppData\Roaming\Mozilla\Firefox\Profiles\u905xshw.default-1360700277389\extensions\

proveďte checkout Gitem do adresáře `{5591137f-ca2c-4c2a-93d1-5514992b2d4a}` (guid
rozšíření musí odpovídat tomu, co je v `install.rdf`):

	git clone https://github.com/arcao/Firenyx.git "{5591137f-ca2c-4c2a-93d1-5514992b2d4a}"

po restartu Firefoxu již rozšíření Firenyx funguje.

Pokud by jste chtěli přispět vašimi změnami, zde je pár kroků, jak na to:

1. [Forkněte tento projekt][fork] do vašeho účtu.
2. [Vytvořte branch][branch] na změny, které chcete provést.
3. Vy checkoutujte projekt, jak je uvedeno výše, ale použijte vaší adresu na forknutý projekt a jméno vaší branche:

		git clone -b vase-branch https://github.com/username/Firenyx.git "{5591137f-ca2c-4c2a-93d1-5514992b2d4a}"

4. Proveďte změny a commitněte je.
5. [Pošlete pull request][pr] z vaší forknuté branche do mojí `master` branche.

[fork]: http://help.github.com/forking/
[branch]: https://help.github.com/articles/creating-and-deleting-branches-within-your-repository
[pr]: http://help.github.com/pull-requests/


## Sestavení XPI instalačního balíčku

Pro sestavení instalačního balíčku je použit Gradle build systém. Sestavení 
provedete přes příkaz:

	gradlew assemble
	
výsledný xpi soubor se pak nachází v adresáři `build\distributions`. Jméno XPI
souboru obsahuje verzi, která je získána ze souboru `install.rdf`.

**Poznámka:**<br>
Pokud se chcete odklonit od vývojové verze a tvořit vlastní produkt, nezapomeňte
do `install.rdf` vygenerovat vlastní guid, ať se to netloukne. 


  
