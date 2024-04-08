pipeline {
  agent any
  environment {
    REGISTRY_HOST = credentials('docker-registry-host')
    REGISTRY_HOST_REMOTE = credentials('docker-registry-domain')
    JENKINS_SERVER = credentials('jenkins-server')
    GIT_REPO_NAME = env.GIT_URL.replaceFirst(/^.*\/([^\/]+?).git$/, '$1').toLowerCase().trim()
    COMPOSE_PROJECT_NAME = 'bvks'
    SLACK_CHANNEL = 'C06FM11STDW'
  }

  stages {
    stage('Build') {
      when {
        allOf {
          not {
            changeRequest()
          }
          anyOf {
            branch 'staging'
          }
        }
      }

      steps {
        script {
            sh """
              case \$BRANCH_NAME in
                development)
                  BUILD_ENV=dev
                  ;;
                staging)
                  BUILD_ENV=stage
                  ;;
                master | main)
                  BUILD_ENV=prod
                  ;;
                *)
                  BUILD_ENV=dev
                  ;;
              esac

              docker build . \
                -f Dockerfile \
                --build-arg build_env=\${BUILD_ENV} \
                -t ${GIT_REPO_NAME}.\${BRANCH_NAME} \
                -t ${GIT_REPO_NAME}.\${BRANCH_NAME}:\${BUILD_NUMBER} \
                -t \${REGISTRY_HOST}/${GIT_REPO_NAME}.\${BRANCH_NAME} \
                -t \${REGISTRY_HOST}/${GIT_REPO_NAME}.\${BRANCH_NAME}:\${BUILD_NUMBER} \
                -t ${GIT_REPO_NAME}-\${BRANCH_NAME} \
                -t ${GIT_REPO_NAME}-\${BRANCH_NAME}:\${BUILD_NUMBER} \
                -t \${REGISTRY_HOST}/${GIT_REPO_NAME}-\${BRANCH_NAME} \
                -t \${REGISTRY_HOST}/${GIT_REPO_NAME}-\${BRANCH_NAME}:\${BUILD_NUMBER}

              docker push -a \${REGISTRY_HOST}/${GIT_REPO_NAME}.\${BRANCH_NAME}
            """

          if (env.BRANCH_NAME == "master" || env.BRANCH_NAME == "main") {
            notify_slack('Production build success')
          }
        }
      }
    }

    stage('Start') {
      parallel {
        stage('Stage') {
          when {
            allOf {
              not {
                changeRequest()
              }
              anyOf {
                branch 'staging'
              }
            }
          }

          environment {
            ENV_FILE = '.stage.env'
            PUBLIC_URL = 'https://bvks.unistory.app'
          }

          steps {
            script {
              sh """
                rm -f ${ENV_FILE}
                touch ${ENV_FILE}

                echo REGISTRY_HOST=${REGISTRY_HOST} >> ${ENV_FILE}
                echo GIT_REPO_NAME=${GIT_REPO_NAME} >> ${ENV_FILE}
                echo BRANCH_NAME=${BRANCH_NAME} >> ${ENV_FILE}
                echo COMPOSE_PROJECT_NAME=stage-${COMPOSE_PROJECT_NAME} >> ${ENV_FILE}

                COMPOSE_PROJECT_NAME=stage-${COMPOSE_PROJECT_NAME} docker-compose -f docker-compose.yml --env-file ${ENV_FILE} up -d
              """
            }
            
            slackSend channel: env.SLACK_CHANNEL, color: "good", message: "Build for ${GIT_REPO_NAME}/${BRANCH_NAME} is successfull: ${PUBLIC_URL}"
          }
        }
      }
    }
  }

  post {
    failure {
      script {
        if (
          env.BRANCH_NAME == "staging"
         ) {
          notify_slack('Build failure')
        }
      }
    }
  }
}
