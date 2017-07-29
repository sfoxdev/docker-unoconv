Unoconv is a simple tool for converting any type of files to PDF documents.

1. Create directory in your server:
mkdir /opt/unoconv

2. Run container:
docker run -d -p 80:3000 --env-file=docker.env -v /opt/unoconv:/opt/unoconvservice/status --name unoconv sfoxdev/unoconv

3. To convert .docx(or any other type of file) to .pdf make POST to Unoconv:
curl --form file=@test.docx http://localhost/unoconv/pdf > test.pdf

4. To check status of converting go to /opt/unoconv you could find to files here:
  - service_started - in this file you could find timestamp when converting was started if file uploaded successfully
  - service_finished - in this file you could find timestamp when converting was finished and 0 if error occurs
