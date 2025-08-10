import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const colleges = ['CMPICA', 'PDPIAS', 'RPCP', 'CSPIT', 'DEPSTAR', 'MTIN'];
const branchesByDept = {
  CMPICA: ['BCA', 'MCA', 'B.Sc. (IT)', 'Ph.D. (Computer Applications)'],
  PDPIAS: ['B.Sc. (Hons.) Microbiology', 'B.Sc. (Hons.) Biochemistry', 'Ph.D. (PDPIAS)'],
  RPCP: ['B.Pharm', 'M.Pharm', 'Ph.D. (Pharmacy)'],
  CSPIT: ['B.Tech AIML', 'B.Tech Civil Engineering', 'B.Tech CSE', 'B.Tech IT'],
  DEPSTAR: ['B.Tech CSE', 'B.Tech IT', 'B.Tech CE'],
  MTIN: ['B.Sc. Nursing', 'Post Basic B.Sc. Nursing', 'M.Sc. Nursing', 'Ph.D. (Nursing)']
};

const CompleteProfile = ({ onSubmit }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const selectedCollege = watch('college');
  const [error, setError] = useState('');

  const handleFormSubmit = (data) => {
    if (!/@charusat/.test(data.email)) {
      setError('Email must be a valid CHARUSAT email ID');
      return;
    }
    setError('');
    onSubmit(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Complete Your Profile</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Roll Number</label>
            <input
              type="text"
              {...register('rollNo', { required: 'Roll number is required' })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your roll number"
            />
            {errors.rollNo && <p className="text-red-500 text-sm mt-1">{errors.rollNo.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">College</label>
            <select
              {...register('college', { required: 'College is required' })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select College</option>
              {colleges.map((college) => (
                <option key={college} value={college}>{college}</option>
              ))}
            </select>
            {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Department</label>
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Department</option>
              {selectedCollege && branchesByDept[selectedCollege]?.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">CHARUSAT Email ID</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your CHARUSAT email ID"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;