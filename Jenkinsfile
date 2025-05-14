pipeline {
    agent any

    environment {
        EC2_IP = '3.79.96.57'
        EC2_USER = 'ec2-user'               // add your EC2 username here
        REPO_NAME = 'Biolabs'
        GIT_CREDENTIALS = 'github-credentials'
        SSH_SECRET_FILE = 'aws-biolabs-key-file'  // This must be a Secret File credential in Jenkins
    }

    parameters {
        booleanParam(name: 'DRY_RUN', defaultValue: true, description: 'Run the pipeline in dry run mode')
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                git credentialsId: "${GIT_CREDENTIALS}",
                    url: 'https://github.com/shiyasali23/Biolabs.git',
                    branch: 'master'
            }
        }

        stage('Test SSH Connection') {
            steps {
                withCredentials([file(credentialsId: "${SSH_SECRET_FILE}", variable: 'SSH_KEY')]) {
                    sh '''
                        chmod 600 "$SSH_KEY"
                        ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" ${EC2_USER}@${EC2_IP} 'echo SSH connection successful'
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            when {
                expression { return params.DRY_RUN == false }
            }
            steps {
                withCredentials([file(credentialsId: "${SSH_SECRET_FILE}", variable: 'SSH_KEY')]) {
                    sh '''
                        chmod 600 "$SSH_KEY"
                        echo "Copying files to EC2..."
                        scp -o StrictHostKeyChecking=no -i "$SSH_KEY" -r \\
                            ./intelligence \\
                            docker-compose.intell.yml \\
                            nginx \\
                            ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/${REPO_NAME}/
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
    }
}
