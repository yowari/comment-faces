FROM centos

MAINTAINER yowari

RUN curl --silent --location https://rpm.nodesource.com/setup_7.x | bash - \
  && yum -y install nodejs gcc-c++ make

RUN yum -y install ImageMagick

RUN yum -y install libpng libjpeg libpng-devel libjpeg-devel ghostscript libtiff libtiff-devel freetype freetype-devel jasper jasper-devel \
  && yum -y install wget \
  && cd /usr/src \
  && wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/1.3/GraphicsMagick-1.3.28.tar.gz \
  && tar -xzvf GraphicsMagick-1.3.28.tar.gz \
  && cd GraphicsMagick-1.3.28 \
  && ./configure \
  && make install

RUN yum -y install bzip2

COPY . /opt/app-root
WORKDIR /opt/app-root

RUN npm install \
  && npm run compile

RUN chmod -R 777 /opt/app-root \
  && chown -R 1001:1001 /opt/app-root

USER 1001

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
