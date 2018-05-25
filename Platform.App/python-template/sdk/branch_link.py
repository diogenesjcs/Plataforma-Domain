from sdk.apicore import ApiCore

"""
 {
        "_metadata": {
            "branch": "master",
            "instance_id": null,
            "modified_at": "2018-05-24T14:15:54.116590",
            "origin": null,
            "type": "branchLink"
        },
        "branchName": "cenario-1",
        "entity": "operacao",
        "id": "50793d75-a8ee-41f8-b16e-36c5368c253d",
        "systemId": "ec498841-59e5-47fd-8075-136d79155705"
    },
"""

class BranchLinkDTO:
    def __init__(self, **kwargs):
        self.branch_name = kwargs.get('branchName')
        self.entity = kwargs.get('entity')
        self.id = kwargs.get('id')
        self.system_id = kwargs.get('systemId')
        self._metadata = kwargs.get('_metadata')

class BranchLink(ApiCore):

    def __init__(self):
        super().__init__()

    def get_links(self):
        return self.get_by_system_id("branchLink")

    def get_links_by_branch(self, branch):
        params = {
            "filter":"bySystemIdAndBranchName",
            "systemId": self.system_id(),
            "branch": branch
        }
        result = self.get("branchLink", params)
        return list(map(lambda x : BranchLinkDTO(**x), result))

    def save(self, items):
        for i in items:
            i["systemId"] = self.system_id()
            i["_metadata"] = {
                "type":"branchLink",
                "changeTrack":"create"
            }
        self.persist(items)