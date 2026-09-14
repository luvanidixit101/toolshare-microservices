FROM maven:3.9.9-eclipse-temurin-21 AS build
ARG SERVICE
WORKDIR /workspace
COPY backend/${SERVICE}/pom.xml backend/${SERVICE}/pom.xml
RUN mvn -f backend/${SERVICE}/pom.xml dependency:go-offline
COPY backend/${SERVICE}/src backend/${SERVICE}/src
RUN mvn -f backend/${SERVICE}/pom.xml package -DskipTests

FROM eclipse-temurin:21-jre
ARG SERVICE
RUN useradd --system --uid 10001 toolshare
WORKDIR /app
COPY --from=build /workspace/backend/${SERVICE}/target/*.jar app.jar
USER toolshare
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
