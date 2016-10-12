curl -c cookies.txt -b cookies.txt 'http://al-ng022.xtr.deltares.nl/login/'
csrftoken=$(tail -n 1 cookies.txt  | cut  -f 7)
curl -c cookies.txt -b cookies.txt 'http://al-ng022.xtr.deltares.nl/login/' --data "username=foo&password=$PASSWORD&csrfmiddlewaretoken=$csrftoken"
curl -c cookies.txt "http://al-ng022.xtr.deltares.nl/api/v1/scenarios/?format=json&csrfmiddlewaretoken=$csrftoken"
