import { useEffect, useState } from 'react';

import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface FoodInfo {
  image: string;
  available: boolean;
  name: string;
  price: string;
  id: number;
  description?: string;
}

interface StateProps {
  foods: FoodInfo[];
  editingFood: FoodInfo;
  modalOpen: boolean;
  editModalOpen: boolean;
}

export function Dashboard() {
  const [state, setState] = useState<StateProps>({ foods: [], editingFood: {} as FoodInfo, modalOpen: false, editModalOpen: false })

  useEffect(() => {
    (async function getFoods() {
      const response = await api.get('/foods');

      setState({ ...state, foods: response.data });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFood = async (food: FoodInfo) => {
    const { foods } = state;

    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setState({ ...state, foods: [...foods, response.data] });
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodInfo) => {
    const { foods, editingFood } = state;

    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setState({ ...state, foods: foodsUpdated });
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: number) => {
    const { foods } = state;

    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setState({ ...state, foods: foodsFiltered });
  }

  const toggleModal = () => {
    const { modalOpen } = state;

    setState((prevState) => {
      return (
        { ...prevState, modalOpen: !modalOpen }
      )
    });
  };

  const toggleEditModal = () => {
    const { editModalOpen } = state;

    setState({ ...state, editModalOpen: !editModalOpen });
  }

  const handleEditFood = (food: FoodInfo) => {
    setState({ ...state, editingFood: food, editModalOpen: true });
  }

  const { modalOpen, editModalOpen, editingFood, foods } = state;

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );

};
