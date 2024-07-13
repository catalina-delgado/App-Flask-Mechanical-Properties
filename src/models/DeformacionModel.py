class Deformacion():
    def __init__(self, id, deformacion) -> None:
        self.id = id
        self.deformacion=deformacion
        
    def to_json(self):
        return {
            'id':self.id,
            'deformacion':self.deformacion
        }