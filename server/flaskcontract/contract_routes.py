import json
import re

from flaskcontract import app, socketio, bcrypt
# from flask_bcrypt import Bcrypt
import datetime
from flaskcontract.models import Message, User, Room, RoomMember, db
from flask import request, session
from flask.json import jsonify
from functools import wraps
from SPARQLWrapper import SPARQLWrapper, BASIC, JSON
import textwrap
from flaskcontract.routes import check_for_session

'''
    sparql setting
'''

HOST_URI_GET = 'http://amar-sti:7200/repositories/SmashHit-Beta'
HOST_URI_POST = 'http://amar-sti:7200/repositories/SmashHit-Beta/statements'
user_name = 'admin'
password = 'Sm@shHitA_CT00L'
SECRET_KEY = 'amar'

# sparql for get uri
sparql = SPARQLWrapper(HOST_URI_GET)
sparql.setCredentials(user_name, password)

# sparql for post uri
sparql_post = SPARQLWrapper(HOST_URI_POST)
sparql_post.setCredentials(user_name, password)


def prefix():
    prefix = textwrap.dedent("""PREFIX : <http://ontologies.atb-bremen.de/smashHitCore#>
        PREFIX gconsent: <https://w3id.org/GConsent#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX dpv: <http://www.w3.org/ns/dpv#>
        PREFIX prov: <http://www.w3.org/ns/prov#>
        PREFIX dcat: <http://www.w3.org/ns/dcat#>
        PREFIX fibo-fnd-agr-ctr: <https://spec.edmcouncil.org/fibo/ontology/FND/Agreements/Contracts/>
        PREFIX dct: <http://purl.org/dc/terms/>
    """)
    return prefix


'''
routes 
'''


@app.route("/contract/api/get_all_contracts", methods=["GET"])
@check_for_session
def get_all_contracts():
    query = textwrap.dedent("""{0}
        select * 
        where{{  ?Contract a :contractID;
                    :hasContractStatus ?ContractStatus;
                    :forPurpose ?Purpose;
                    :contractType ?ContractType;
                    :DataController ?DataController;
                    :ContractRequester ?ContractRequester;
                    :ContractProvider ?ContractProvider;
                    dcat:startDate ?StartDate;
                    dcat:endDate ?EndingDate;
                    fibo-fnd-agr-ctr:hasEffectiveDate ?EffectiveDate;
                    fibo-fnd-agr-ctr:hasExecutionDate ?ExecutionDate;
                    :inMedium ?Medium;
                    :hasWaiver ?Waiver;
                    :hasAmendment ?Amendment;
                    :hasConfidentialityObligation ?ConfidentialityObligation;
                    :hasDataProtection ?DataProtection;
                    :hasLimitationOnUse ?LimitationOnUse;
                    :hasMethodOfNotice ?MethodOfNotice;
                    :hasNoThirdPartyBeneficiaries ?NoThirdPartyBeneficiaries;
                    :hasPermittedDisclosure ?PermittedDisclosure;
                    :hasReceiptOfNotice ?ReceiptOfNotice;
                    :hasSeverability ?Severability;
                    :hasTerminationForInsolvency ?TerminationForInsolvency;
                    :hasTerminationForMaterialBreach ?TerminationForMaterialBreach;
                    :hasTerminationOnNotice ?TerminationOnNotice .
    }}
    """).format(prefix())
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    result = sparql.query().convert()
    if len(result) > 0:
        return jsonify({"success": result}), 200
    elif len(result) == 0:
        return jsonify({"success": "No record available"}), 200
    else:
        return jsonify({"error": "There are some issues to access the record"}), 500


@app.route("/contract/api/get_contract_by_id/<string:id>", methods=["GET"])
@check_for_session
def get_contract_by_id(id):
    query = textwrap.dedent("""{0}
                SELECT *   
                    WHERE {{ 
                    ?Contract a :contractID;
                            :hasContractStatus ?ContractStatus;
                            :forPurpose ?Purpose;
                            :contractType ?ContractType;
                            :DataController ?DataController;
                            :ContractRequester ?ContractRequester;
                            :ContractProvider ?ContractProvider;
                            dcat:startDate ?StartDate;
                            dcat:endDate ?EndingDate;
                            fibo-fnd-agr-ctr:hasEffectiveDate ?EffectiveDate;
                            fibo-fnd-agr-ctr:hasExecutionDate ?ExecutionDate;
                            :inMedium ?Medium;
                            :hasWaiver ?Waiver;
                            :hasAmendment ?Amendment;
                            :hasConfidentialityObligation ?ConfidentialityObligation;
                            :hasDataProtection ?DataProtection;
                            :hasLimitationOnUse ?LimitationOnUse;
                            :hasMethodOfNotice ?MethodOfNotice;
                            :hasNoThirdPartyBeneficiaries ?NoThirdPartyBeneficiaries;
                            :hasPermittedDisclosure ?PermittedDisclosure;
                            :hasReceiptOfNotice ?ReceiptOfNotice;
                            :hasSeverability ?Severability;
                            :hasTerminationForInsolvency ?TerminationForInsolvency;
                            :hasTerminationForMaterialBreach ?TerminationForMaterialBreach;
                            :hasTerminationOnNotice ?TerminationOnNotice .
                    filter(?Contract=:{1}) .
                }}""").format(prefix(), id)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    result = sparql.query().convert()
    # print(result["results"])
    if len(result) > 0:
        return jsonify({"success": result["results"]}), 200
    elif len(result) == 0:
        return jsonify({"success": "No record available"}), 200
    else:
        return jsonify({"error": "There are some issues to access the record"}), 500


@app.route("/contract/api/get_contract_by_provider/<string:name>", methods=["GET"])
@check_for_session
def get_contract_by_provider(name):
    query = textwrap.dedent("""{0}
                SELECT ?Contract   
                    WHERE {{ 
                    ?Contract a :contractID;
                            :ContractProvider :{1}.
                }}""").format(prefix(), name)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    result = sparql.query().convert()

    if len(result["results"]["bindings"]) >= 1:
        return jsonify({"success": result["results"]}), 200
    elif len(result["results"]["bindings"]) == 0:
        return jsonify({"success": "No record available"}), 200
    else:
        return jsonify({"error": "There are some issues to access the record"}), 500


@app.route("/contract/api/get_contract_by_requester/<string:name>", methods=["GET"])
@check_for_session
def get_contract_by_requester(name):
    query = textwrap.dedent("""{0}
                SELECT ?Contract   
                    WHERE {{ 
                    ?Contract a :contractID;
                            :ContractRequester :{1}.
                }}""").format(prefix(), name)

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    result = sparql.query().convert()

    if len(result["results"]["bindings"]) >= 1:
        return jsonify({"success": result["results"]}), 200
    elif len(result["results"]["bindings"]) == 0:
        return jsonify({"success": "No record available"}), 200
    else:
        return jsonify({"error": "There are some issues to access the record"}), 500


'''
    insert into graph db
'''


@app.route("/contract/api/create", methods=["POST"])
@check_for_session
def contract_create():
    request_data = request.get_json()
    ContractId = request_data["ContractId"]
    # check if contract already exist with this id
    result = get_contract_by_id(ContractId)
    my_json = result[0].data.decode("utf-8")
    decoded_data = json.loads(my_json)
    if decoded_data["success"]["bindings"]:
        contract_id = decoded_data["success"]["bindings"][0]["Contract"]["value"]
        if contract_id != "":
            return jsonify({'error': "Contract id already exist"}), 409
    else:
        Purpose = request_data["Purpose"]
        StartDate = request_data["StartDate"]
        EffectiveDate = request_data["EffectiveDate"]
        ExecutionDate = request_data["ExecutionDate"]
        ExpireDate = request_data["ExpireDate"]
        ContractProvider = request_data["ContractProvider"]
        ContractRequester = request_data["ContractRequester"]
        DataController = request_data["DataController"]
        ContractType = request_data["ContractType"]
        ContractStatus = request_data["ContractStatus"]
        Amendment = request_data["Amendment"]
        ConfidentialityObligation = request_data["ConfidentialityObligation"]
        DataProtection = request_data["DataProtection"]
        LimitationOnUse = request_data["LimitationOnUse"]
        Medium = request_data["Medium"]
        MethodOfNotice = request_data["MethodOfNotice"]
        NoThirdPartyBeneficiaries = request_data["NoThirdPartyBeneficiaries"]
        PermittedDisclosure = request_data["PermittedDisclosure"]
        ReceiptOfNotice = request_data["ReceiptOfNotice"]
        Severability = request_data["Severability"]
        TerminationForInsolvency = request_data["TerminationForInsolvency"]
        TerminationForMaterialBreach = request_data["TerminationForMaterialBreach"]
        TerminationOnNotice = request_data["TerminationOnNotice"]
        Waiver = request_data["Waiver"]

        insquery = textwrap.dedent("""{0}
            INSERT DATA {{
            :{1} a <http://ontologies.atb-bremen.de/smashHitCore#contractID>;
            :contractType :{2};
                       :forPurpose "{3}";
                       :ContractRequester :{4};
                       :ContractProvider :{5};
                       :DataController :{6};
                        dcat:startDate "{7}";
                        fibo-fnd-agr-ctr:hasExecutionDate "{8}";
                        fibo-fnd-agr-ctr:hasEffectiveDate "{9}";
                        dcat:endDate "{10}";
                        :inMedium "{11}";
                        :hasWaiver "{12}";
                        :hasAmendment "{13}";
                        :hasConfidentialityObligation "{14}";
                        :hasDataProtection "{15}";
                        :hasLimitationOnUse "{16}";
                        :hasMethodOfNotice "{17}";
                        :hasNoThirdPartyBeneficiaries "{18}";
                        :hasPermittedDisclosure "{19}";
                        :hasReceiptOfNotice "{20}";
                        :hasSeverability "{21}";
                        :hasTerminationForInsolvency "{22}";
                        :hasTerminationForMaterialBreach "{23}";
                        :hasTerminationOnNotice "{24}";
                        :hasContractStatus :{25} .
                   }}
    
          """.format(prefix(), ContractId, ContractType,
                     Purpose, ContractRequester,
                     ContractProvider, DataController, StartDate,
                     ExecutionDate, EffectiveDate, ExpireDate, Medium, Waiver, Amendment,
                     ConfidentialityObligation, DataProtection, LimitationOnUse,
                     MethodOfNotice, NoThirdPartyBeneficiaries, PermittedDisclosure,
                     ReceiptOfNotice, Severability, TerminationForInsolvency,
                     TerminationForMaterialBreach, TerminationOnNotice, ContractStatus))

        sparql_post.setHTTPAuth(BASIC)
        sparql_post.setQuery(insquery)
        sparql_post.method = "POST"
        sparql_post.queryType = "INSERT"
        sparql_post.setReturnFormat(JSON)
        result = sparql_post.query().convert()
        if len(result) == 0:
            return jsonify({"success": "Record has been created successfully"}), 200
        else:
            return jsonify({"error": "Record can't be created due some issues"}), 500


@app.route("/contract/api/update/<string:id>", methods=["PUT"])
@check_for_session
def contract_update(id):
    request_data = request.get_json()
    ContractId = id
    # check if contract already exist with this id
    result = get_contract_by_id(ContractId)
    my_json = result[0].data.decode("utf-8")
    decoded_data = json.loads(my_json)
    if decoded_data["success"]["bindings"]:
        contract_id = decoded_data["success"]["bindings"][0]["Contract"]["value"]
        if contract_id != "":
            contract_status = decoded_data["success"]["bindings"][0]["ContractStatus"]["value"]
            signed = re.findall(r"Signed", contract_status)
            if len(signed) == 0:
                # delete the old contract
                resp = contract_delete_by_id(id)
                # insert contract
                Purpose = request_data["Purpose"]
                StartDate = request_data["StartDate"]
                EffectiveDate = request_data["EffectiveDate"]
                ExecutionDate = request_data["ExecutionDate"]
                ExpireDate = request_data["ExpireDate"]
                ContractProvider = request_data["ContractProvider"]
                ContractRequester = request_data["ContractRequester"]
                DataController = request_data["DataController"]
                ContractType = request_data["ContractType"]
                ContractStatus = request_data["ContractStatus"]
                Amendment = request_data["Amendment"]
                ConfidentialityObligation = request_data["ConfidentialityObligation"]
                DataProtection = request_data["DataProtection"]
                LimitationOnUse = request_data["LimitationOnUse"]
                Medium = request_data["Medium"]
                MethodOfNotice = request_data["MethodOfNotice"]
                NoThirdPartyBeneficiaries = request_data["NoThirdPartyBeneficiaries"]
                PermittedDisclosure = request_data["PermittedDisclosure"]
                ReceiptOfNotice = request_data["ReceiptOfNotice"]
                Severability = request_data["Severability"]
                TerminationForInsolvency = request_data["TerminationForInsolvency"]
                TerminationForMaterialBreach = request_data["TerminationForMaterialBreach"]
                TerminationOnNotice = request_data["TerminationOnNotice"]
                Waiver = request_data["Waiver"]

                insquery = textwrap.dedent("""{0}
                    INSERT DATA {{
                    :{1} a <http://ontologies.atb-bremen.de/smashHitCore#contractID>;
                    :contractType :{2};
                               :forPurpose "{3}";
                               :ContractRequester :{4};
                               :ContractProvider :{5};
                               :DataController :{6};
                                dcat:startDate "{7}";
                                fibo-fnd-agr-ctr:hasExecutionDate "{8}";
                                fibo-fnd-agr-ctr:hasEffectiveDate "{9}";
                                dcat:endDate "{10}";
                                :inMedium "{11}";
                                :hasWaiver "{12}";
                                :hasAmendment "{13}";
                                :hasConfidentialityObligation "{14}";
                                :hasDataProtection "{15}";
                                :hasLimitationOnUse "{16}";
                                :hasMethodOfNotice "{17}";
                                :hasNoThirdPartyBeneficiaries "{18}";
                                :hasPermittedDisclosure "{19}";
                                :hasReceiptOfNotice "{20}";
                                :hasSeverability "{21}";
                                :hasTerminationForInsolvency "{22}";
                                :hasTerminationForMaterialBreach "{23}";
                                :hasTerminationOnNotice "{24}";
                                :hasContractStatus :{25} .
                           }}

                  """.format(prefix(), ContractId, ContractType,
                             Purpose, ContractRequester,
                             ContractProvider, DataController, StartDate,
                             ExecutionDate, EffectiveDate, ExpireDate, Medium, Waiver, Amendment,
                             ConfidentialityObligation, DataProtection, LimitationOnUse,
                             MethodOfNotice, NoThirdPartyBeneficiaries, PermittedDisclosure,
                             ReceiptOfNotice, Severability, TerminationForInsolvency,
                             TerminationForMaterialBreach, TerminationOnNotice, ContractStatus))

                sparql_post.setHTTPAuth(BASIC)
                sparql_post.setQuery(insquery)
                sparql_post.method = "POST"
                sparql_post.queryType = "INSERT"
                sparql_post.setReturnFormat(JSON)
                result = sparql_post.query().convert()
                if len(result) == 0:
                    return jsonify({"success": "Record has been updated successfully"}), 200
                else:
                    return jsonify({"error": "Record can't be updated due some issues"}), 500
            else:
                return jsonify({"error": "A signed contract can't be modified"}), 409
    return jsonify({'error': "There are issues to access the record"}), 500


@app.route("/contract/api/contract_delete_by_id/<string:id>", methods=["DELETE"])
@check_for_session
def contract_delete_by_id(id):
    result = get_contract_by_id(id)
    my_json = result[0].data.decode("utf-8")
    decoded_data = json.loads(my_json)
    if decoded_data["success"]["bindings"]:
        contract_id = decoded_data["success"]["bindings"][0]["Contract"]["value"]

        if contract_id != "":
            contract_status = decoded_data["success"]["bindings"][0]["ContractStatus"]["value"]
            signed = re.findall(r"Signed", contract_status)
            if len(signed) == 0:
                query = textwrap.dedent("""{0}
                                delete{{?s ?p ?o}}   
                                    WHERE {{ 
                                    select ?s ?p ?o
                                        where{{
                                            ?s ?p ?o .
                                            filter(?s=:{1})
                                }}}}""").format(prefix(), id)
                sparql_post.setHTTPAuth(BASIC)
                sparql_post.setQuery(query)
                sparql_post.method = "POST"
                sparql_post.queryType = "DELETE"
                sparql_post.setReturnFormat(JSON)
                result = sparql_post.query().convert()
                if len(result) == 0:
                    return jsonify({"success": "Record has been deleted successfully"}), 200
                else:
                    return jsonify({"error": "Record can't be deleted due some issues"}), 500
    else:
        return jsonify({"error": "Contract id doesn't exist"}), 500
